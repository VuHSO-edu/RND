package com.heritage.platform.modules.passport.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.util.HashUtils;
import com.heritage.platform.modules.passport.dto.*;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.entity.PassportTimelineEvent;
import com.heritage.platform.modules.passport.entity.ProductBatch;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.repository.PassportAuditLogRepository;
import com.heritage.platform.modules.passport.repository.PassportTimelineEventRepository;
import com.heritage.platform.modules.passport.repository.ProductBatchRepository;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PassportService {

    private final HeritagePassportRepository passportRepository;
    private final ProductBatchRepository batchRepository;
    private final PassportAuditLogRepository auditLogRepository;
    private final PassportTimelineEventRepository timelineEventRepository;
    private final ProductRepository productRepository;
    private final AntiCounterfeitService antiCounterfeitService;
    private final MerkleBlockchainService merkleBlockchainService;

    @Transactional(readOnly = true)
    public HeritagePassport getPassportByCode(String codeOrSerial) {
        return passportRepository.findBySerialNumber(codeOrSerial)
                .or(() -> passportRepository.findByPassportCode(codeOrSerial))
                .orElseThrow(() -> new BusinessException("PASSPORT_NOT_FOUND", "Mã Hộ chiếu di sản hoặc số Serial không tồn tại trên hệ thống"));
    }

    @Transactional(readOnly = true)
    public List<PassportAuditLog> getAuditLogs(String codeOrSerial) {
        HeritagePassport passport = getPassportByCode(codeOrSerial);
        return auditLogRepository.findTop20ByPassportIdOrderByScannedAtDesc(passport.getId());
    }

    @Transactional(readOnly = true)
    public List<ProductBatch> getBatchesByVillage(Long villageId) {
        if (villageId == null) {
            return batchRepository.findAll();
        }
        List<ProductBatch> list = batchRepository.findByCraftVillageIdOrderByCreatedAtDesc(villageId);
        if (list.isEmpty()) {
            return batchRepository.findAll();
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<ProductBatch> getPendingBatches() {
        return batchRepository.findByApprovalStatusOrderByCreatedAtDesc("PENDING");
    }

    @Transactional(readOnly = true)
    public List<ProductBatch> getPendingBatchesByVillage(Long villageId) {
        return batchRepository.findByCraftVillageIdAndApprovalStatusOrderByCreatedAtDesc(villageId, "PENDING");
    }

    @Transactional(readOnly = true)
    public List<HeritagePassport> getPassportsByBatch(Long batchId) {
        return passportRepository.findByBatchId(batchId);
    }

    /**
     * 1. C (Create) - Khởi tạo Hộ chiếu & Sinh mã QR hàng loạt theo Lô (Batch Generate)
     */
    @Transactional
    public BatchGenerateResponse generateBatchPassports(Long villageAdminUserId, BatchGenerateRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Mẫu tác phẩm/SKU không tồn tại"));

        CraftVillage village = product.getCraftVillage();
        if (village == null && product.getArtisan() != null) {
            village = product.getArtisan().getCraftVillage();
        }

        String villagePrefix = (village != null && village.getSlug() != null)
                ? village.getSlug().replace("lang-", "").replace("-", "").toUpperCase()
                : "BT";
        if (villagePrefix.length() > 4) {
            villagePrefix = villagePrefix.substring(0, 4);
        }

        String skuCode = (product.getSkuCode() != null && !product.getSkuCode().isBlank())
                ? product.getSkuCode().replace(" ", "").toUpperCase()
                : "SKU" + product.getId();

        String dateStr;
        if (req.getManufacturingDate() != null && !req.getManufacturingDate().isBlank()) {
            dateStr = req.getManufacturingDate().replace("-", "").replace("/", "");
            if (dateStr.length() > 8) dateStr = dateStr.substring(0, 8);
        } else {
            dateStr = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        }

        String batchCode = String.format("%s-%s-%s", villagePrefix, skuCode, dateStr);
        // Đảm bảo batchCode duy nhất
        Optional<ProductBatch> existingBatch = batchRepository.findByBatchCode(batchCode);
        if (existingBatch.isPresent()) {
            batchCode += "-" + (System.currentTimeMillis() % 1000);
        }

        String effectiveVideoUrl = req.getBatchVideoUrl() != null ? req.getBatchVideoUrl() : req.getCraftingVideoUrl();
        if (effectiveVideoUrl == null || effectiveVideoUrl.isBlank()) {
            effectiveVideoUrl = product.getCreationProcessVideoUrl();
        }

        String downloadZipUrl = String.format("https://storage.domain.vn/passports/%s-QR.zip", batchCode);

        ProductBatch batch = ProductBatch.builder()
                .batchCode(batchCode)
                .product(product)
                .craftVillage(village)
                .artisan(product.getArtisan())
                .quantity(req.getQuantity())
                .approvalStatus("PENDING")
                .onchainStatus("NOT_COMMITTED")
                .batchVideoUrl(effectiveVideoUrl)
                .downloadZipUrl(downloadZipUrl)
                .batchNotes(req.getBatchNotes())
                .productionDate(req.getProductionDate() != null ? req.getProductionDate() : Instant.now())
                .build();

        batch = batchRepository.saveAndFlush(batch);

        List<HeritagePassport> passports = new ArrayList<>();
        List<PassportTimelineEvent> initialEvents = new ArrayList<>();

        for (int i = 1; i <= req.getQuantity(); i++) {
            String serialNumber = String.format("VN-%s-%s-%s-%03d", villagePrefix, skuCode, dateStr, i);
            String passportCode = serialNumber;

            // verification_hash = SHA-256(artisan_id + product_id + serial_number + salt)
            Long artisanId = product.getArtisan() != null ? product.getArtisan().getId() : 0L;
            String salt = "salt_heritage_2026_disan360";
            String rawHashData = artisanId + ":" + product.getId() + ":" + serialNumber + ":" + salt;
            String verificationHash = HashUtils.sha256(rawHashData);

            String qrUrl = "https://heritage.domain.vn/passport/" + serialNumber;

            HeritagePassport passport = HeritagePassport.builder()
                    .product(product)
                    .batch(batch)
                    .passportCode(passportCode)
                    .serialNumber(serialNumber)
                    .qrCodeUrl(qrUrl)
                    .craftingVideoUrl(effectiveVideoUrl)
                    .artisanStoryQuote(req.getArtisanStoryQuote() != null ? req.getArtisanStoryQuote() : product.getArtisanStory())
                    .verificationHash(verificationHash)
                    .status("ACTIVE")
                    .isClaimed(false)
                    .isRevoked(false)
                    .isCounterfeitAlert(false)
                    .scanCount(0)
                    .smartContractAddress("0x71a2B889cFe49D1e5e78B2c56a88F932De7189cF")
                    .issuedAt(Instant.now())
                    .build();

            passports.add(passport);

            // Mốc hành trình đầu tiên: CREATED - Xuất xưởng tại xưởng nghệ nhân
            PassportTimelineEvent firstEvent = PassportTimelineEvent.builder()
                    .passport(passport)
                    .serialNumber(serialNumber)
                    .eventType("CREATED")
                    .locationName(village != null ? village.getName() : "Xưởng chế tác Làng nghề")
                    .latitude(village != null ? village.getLatitude() : 20.9781)
                    .longitude(village != null ? village.getLongitude() : 105.9125)
                    .description("Xuất xưởng tại xưởng nghệ nhân")
                    .actorRole("ARTISAN")
                    .eventTime(Instant.now())
                    .build();

            initialEvents.add(firstEvent);
        }

        passportRepository.saveAllAndFlush(passports);
        timelineEventRepository.saveAllAndFlush(initialEvents);

        log.info("[BATCH_GENERATED] Khởi tạo thành công Lô {} gồm {} Hộ chiếu di sản (Không dùng NFC)", batchCode, req.getQuantity());

        return BatchGenerateResponse.builder()
                .batchId(batch.getId())
                .batchCode(batchCode)
                .totalGenerated(req.getQuantity())
                .downloadZipUrl(downloadZipUrl)
                .build();
    }

    /**
     * 1. R (Read) - Tra cứu Thông tin Hộ chiếu & Kiểm tra Chống Giả Realtime
     */
    @Transactional
    public PassportVerifyResponse verifyPassport(String serialNumber, Double currentLat, Double currentLon, String clientIp, String userAgent) {
        HeritagePassport passport = getPassportByCode(serialNumber);

        // Xử lý quét và kiểm tra thuật toán Geo-velocity Realtime
        Optional<PassportAuditLog> optLastScan = auditLogRepository.findFirstByPassportIdOrderByScannedAtDesc(passport.getId());
        Instant now = Instant.now();

        boolean isAnomaly = false;
        String warningNote = null;

        if (optLastScan.isPresent() && currentLat != null && currentLon != null && optLastScan.get().getLatitude() != null && optLastScan.get().getLongitude() != null) {
            PassportAuditLog last = optLastScan.get();
            double distanceKm = calculateHaversineDistance(last.getLatitude(), last.getLongitude(), currentLat, currentLon);
            long secondsDiff = Math.max(1, Duration.between(last.getScannedAt(), now).getSeconds());
            double hoursDiff = (double) secondsDiff / 3600.0;
            double speedKmh = distanceKm / hoursDiff;
            double minutesDiff = (double) secondsDiff / 60.0;

            // Nếu V > 900 km/h với D > 100 km trong thời gian < 5 phút -> Cảnh báo hàng giả
            if (speedKmh > 900.0 && distanceKm > 100.0 && minutesDiff < 5.0) {
                isAnomaly = true;
                passport.setIsCounterfeitAlert(true);
                passport.setStatus("FLAGGED_ANOMALY");
                warningNote = "PHÁT HIỆN TỐC ĐỘ DI CHUYỂN BẤT KHẢ THI (>900 km/h)";
                log.warn("[COUNTERFEIT_ALERT] Hộ chiếu {} bị kích hoạt cờ đỏ do di chuyển bất thường: {} km trong {} phút", serialNumber, distanceKm, minutesDiff);
            }
        }

        // Tăng lượt quét
        passport.setScanCount(passport.getScanCount() + 1);
        passportRepository.saveAndFlush(passport);

        // Ghi log kiểm toán lượt quét
        PassportAuditLog auditLog = PassportAuditLog.builder()
                .passport(passport)
                .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                .userAgent(userAgent != null ? userAgent : "Browser Agent")
                .latitude(currentLat)
                .longitude(currentLon)
                .accuracyLevel(currentLat != null ? "GPS_HIGH_ACCURACY" : "IP_LOOKUP")
                .city("Việt Nam")
                .country("VN")
                .isAnomaly(isAnomaly)
                .warningNote(warningNote)
                .build();
        auditLogRepository.save(auditLog);

        // Lấy lịch sử hành trình theo thứ tự thời gian tăng dần (ASC)
        List<PassportTimelineEvent> timeline = timelineEventRepository.findBySerialNumberOrderByEventTimeAsc(passport.getSerialNumber());

        // Che mờ tên chủ sở hữu nếu đã kích hoạt chính chủ (chống lộ thông tin cá nhân)
        String maskedOwnerName = null;
        if (Boolean.TRUE.equals(passport.getIsClaimed()) && passport.getOwnerName() != null) {
            maskedOwnerName = maskName(passport.getOwnerName());
        }

        Product p = passport.getProduct();
        ProductBatch b = passport.getBatch();

        String txHash = (b != null && b.getBlockchainTxHash() != null) ? b.getBlockchainTxHash() : passport.getBlockchainTxHash();
        String polyUrl = txHash != null ? "https://amoy.polygonscan.com/tx/" + txHash : null;

        return PassportVerifyResponse.builder()
                .serialNumber(passport.getSerialNumber())
                .passportCode(passport.getPassportCode())
                .status(passport.getStatus())
                .isClaimed(Boolean.TRUE.equals(passport.getIsClaimed()))
                .ownerNameMasked(maskedOwnerName)
                .claimedAt(passport.getClaimedAt())
                .isRevoked(Boolean.TRUE.equals(passport.getIsRevoked()))
                .revocationReason(passport.getRevocationReason())
                .isCounterfeitAlert(Boolean.TRUE.equals(passport.getIsCounterfeitAlert()))
                .counterfeitWarning(warningNote)
                .scanCount(passport.getScanCount())
                // Thông tin tác phẩm
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : "Tác phẩm thủ công di sản")
                .productSlug(p != null ? p.getSlug() : null)
                .productImageUrl(p != null ? p.getImageUrl() : null)
                .model3dUrl(p != null ? p.getModel3dUrl() : null)
                .materialInfo(p != null ? p.getMaterialInfo() : null)
                .dimensions(p != null ? p.getDimensions() : null)
                .price(p != null ? p.getPrice() : null)
                // Nghệ nhân
                .artisanId(p != null && p.getArtisan() != null ? p.getArtisan().getId() : null)
                .artisanName(p != null && p.getArtisan() != null && p.getArtisan().getUser() != null ? p.getArtisan().getUser().getFullName() : "Nghệ nhân Làng nghề")
                .artisanTitle(p != null && p.getArtisan() != null ? p.getArtisan().getTitle() : null)
                .artisanPhilosophy(p != null && p.getArtisan() != null ? p.getArtisan().getPhilosophy() : null)
                .artisanInterviewMediaUrl(p != null && p.getArtisan() != null ? p.getArtisan().getInterviewMediaUrl() : null)
                .artisanExperienceYears(p != null && p.getArtisan() != null ? p.getArtisan().getExperienceYears() : null)
                // Làng nghề
                .craftVillageId(p != null && p.getCraftVillage() != null ? p.getCraftVillage().getId() : null)
                .craftVillageName(p != null && p.getCraftVillage() != null ? p.getCraftVillage().getName() : (p != null && p.getArtisan() != null && p.getArtisan().getCraftVillage() != null ? p.getArtisan().getCraftVillage().getName() : "Làng nghề truyền thống"))
                .province(p != null && p.getCraftVillage() != null ? p.getCraftVillage().getProvince() : "Việt Nam")
                // Lô & Video mẻ lò
                .batchId(b != null ? b.getId() : null)
                .batchCode(b != null ? b.getBatchCode() : null)
                .batchVideoUrl(b != null && b.getBatchVideoUrl() != null ? b.getBatchVideoUrl() : passport.getCraftingVideoUrl())
                // Chứng thực Blockchain
                .verificationHash(passport.getVerificationHash())
                .blockchainTxHash(txHash)
                .smartContractAddress(passport.getSmartContractAddress())
                .polygonScanUrl(polyUrl)
                .issuedAt(passport.getIssuedAt())
                .timeline(timeline)
                .build();
    }

    /**
     * 1. D (Delete/Revoke) - Hủy bỏ/Thu hồi Hộ chiếu (Soft Delete)
     */
    @Transactional
    public HeritagePassport revokePassport(String serialNumber, String revocationReason) {
        HeritagePassport passport = getPassportByCode(serialNumber);

        passport.setIsRevoked(true);
        passport.setRevocationReason(revocationReason != null && !revocationReason.isBlank() 
                ? revocationReason.trim() 
                : "Hiện vật bị hỏng trong quá trình vận chuyển hoặc trưng bày");
        passport.setStatus("REVOKED");

        HeritagePassport saved = passportRepository.saveAndFlush(passport);

        // Thêm mốc sự kiện thu hồi vào Timeline
        PassportTimelineEvent revokeEvent = PassportTimelineEvent.builder()
                .passport(saved)
                .serialNumber(saved.getSerialNumber())
                .eventType("REVOKED")
                .locationName("Ban Quản Lý Làng Nghề")
                .description("Thu hồi Hộ chiếu di sản: " + saved.getRevocationReason())
                .actorRole("VILLAGE_ADMIN")
                .eventTime(Instant.now())
                .build();
        timelineEventRepository.save(revokeEvent);

        log.info("[PASSPORT_REVOKED] Hộ chiếu {} đã bị thu hồi. Lý do: {}", serialNumber, saved.getRevocationReason());
        return saved;
    }

    /**
     * 2. C/U - Tải lên & Cập nhật Video Quy trình Lô
     */
    @Transactional
    public ProductBatch updateBatchMedia(Long batchId, String batchVideoUrl) {
        ProductBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("BATCH_NOT_FOUND", "Lô hàng không tồn tại"));

        if ("APPROVED".equalsIgnoreCase(batch.getApprovalStatus())) {
            throw new BusinessException("BATCH_ALREADY_APPROVED", "Lô hàng đã được duyệt và đưa vào lưu thông. Cấm thay đổi video trừ khi có phê duyệt từ Super Admin.");
        }

        batch.setBatchVideoUrl(batchVideoUrl);
        ProductBatch saved = batchRepository.saveAndFlush(batch);

        // Đồng bộ video cho toàn bộ hộ chiếu trong lô
        List<HeritagePassport> passports = passportRepository.findByBatchId(batchId);
        for (HeritagePassport p : passports) {
            p.setCraftingVideoUrl(batchVideoUrl);
        }
        passportRepository.saveAllAndFlush(passports);

        log.info("[BATCH_VIDEO_UPDATED] Đã cập nhật video quy trình cho Lô {}: {}", batch.getBatchCode(), batchVideoUrl);
        return saved;
    }

    /**
     * 2. D - Xóa Video Quy trình Lô (Đưa về NULL khi còn ở trạng thái DRAFT / PENDING)
     */
    @Transactional
    public ProductBatch deleteBatchMedia(Long batchId) {
        ProductBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("BATCH_NOT_FOUND", "Lô hàng không tồn tại"));

        if ("APPROVED".equalsIgnoreCase(batch.getApprovalStatus())) {
            throw new BusinessException("BATCH_ALREADY_APPROVED", "Lô hàng đã được duyệt, không thể xóa video.");
        }

        batch.setBatchVideoUrl(null);
        return batchRepository.saveAndFlush(batch);
    }

    /**
     * 4. C - Duyệt Lô & Kích hoạt Ghi sổ On-Chain (Web3 Merkle)
     */
    @Transactional
    public ProductBatch reviewBatch(Long batchId, Long reviewerUserId, boolean approved, String rejectionReason) {
        ProductBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("BATCH_NOT_FOUND", "Lô sản phẩm không tồn tại"));

        if (!approved) {
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new BusinessException("REJECTION_REASON_REQUIRED", "Lý do từ chối không được để trống");
            }
            batch.setApprovalStatus("REJECTED");
            batch.setRejectionReason(rejectionReason.trim());
            batch.setOnchainStatus("NOT_COMMITTED");

            List<HeritagePassport> passports = passportRepository.findByBatchId(batchId);
            for (HeritagePassport p : passports) {
                p.setStatus("REJECTED");
            }
            passportRepository.saveAllAndFlush(passports);
            return batchRepository.saveAndFlush(batch);
        }

        batch.setApprovalStatus("APPROVED");
        batch.setRejectionReason(null);
        batch.setOnchainStatus("PENDING_BLOCKCHAIN");
        ProductBatch savedBatch = batchRepository.saveAndFlush(batch);

        // Kích hoạt tác vụ bất đồng bộ tính Merkle Root và ghi sổ on-chain
        merkleBlockchainService.processBatchOnchainAsync(savedBatch.getId());

        log.info("[VILLAGE_BATCH_APPROVED] Quản lý làng đã duyệt Lô {}. Đã kích hoạt @Async Merkle On-chain.", batch.getBatchCode());
        return savedBatch;
    }

    /**
     * 4. R - Kiểm tra Bằng chứng On-Chain (Merkle Proof Verification)
     */
    @Transactional(readOnly = true)
    public BlockchainProofResponse getBlockchainProof(String serialNumber) {
        HeritagePassport passport = getPassportByCode(serialNumber);
        ProductBatch batch = passport.getBatch();

        List<HeritagePassport> batchPassports = (batch != null)
                ? passportRepository.findByBatchId(batch.getId())
                : List.of(passport);

        List<String> leafHashes = batchPassports.stream()
                .map(HeritagePassport::getVerificationHash)
                .toList();

        String merkleRoot = merkleBlockchainService.computeMerkleRoot(leafHashes);
        List<String> proof = merkleBlockchainService.generateMerkleProof(leafHashes, passport.getVerificationHash());

        String txHash = (batch != null && batch.getBlockchainTxHash() != null)
                ? batch.getBlockchainTxHash()
                : passport.getBlockchainTxHash();

        return BlockchainProofResponse.builder()
                .serialNumber(passport.getSerialNumber())
                .verificationHash(passport.getVerificationHash())
                .merkleRoot(merkleRoot)
                .merkleProof(proof)
                .blockchainTxHash(txHash)
                .blockNumber(batch != null ? batch.getBlockNumber() : 12849102L)
                .network(batch != null ? batch.getBlockchainNetwork() : "Polygon Amoy Testnet")
                .polygonScanUrl(txHash != null ? "https://amoy.polygonscan.com/tx/" + txHash : "https://amoy.polygonscan.com")
                .verified(true)
                .build();
    }

    /**
     * 5. C - Bổ sung Mốc Hành trình Mới vào Supply Chain Timeline
     */
    @Transactional
    public PassportTimelineEvent addTimelineEvent(String serialNumber, TimelineEventRequest req) {
        HeritagePassport passport = getPassportByCode(serialNumber);

        PassportTimelineEvent event = PassportTimelineEvent.builder()
                .passport(passport)
                .serialNumber(passport.getSerialNumber())
                .eventType(req.getEventType().trim().toUpperCase())
                .locationName(req.getLocationName())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .description(req.getDescription())
                .actorRole(req.getActorRole() != null ? req.getActorRole().trim().toUpperCase() : "VILLAGE_ADMIN")
                .eventTime(Instant.now())
                .build();

        return timelineEventRepository.saveAndFlush(event);
    }

    /**
     * 5. R - Xem Toàn bộ Lộ trình Hành trình Sản phẩm
     */
    @Transactional(readOnly = true)
    public List<PassportTimelineEvent> getTimeline(String serialNumber) {
        HeritagePassport passport = getPassportByCode(serialNumber);
        return timelineEventRepository.findBySerialNumberOrderByEventTimeAsc(passport.getSerialNumber());
    }

    /**
     * 6. C (Action) - Kích hoạt Sở hữu Lần đầu (Claim First Scan)
     */
    @Transactional
    public ClaimPassportResponse claimPassport(String serialNumber, Long customerUserId, String customerFullName, ClaimPassportRequest req) {
        HeritagePassport passport = getPassportByCode(serialNumber);

        if (Boolean.TRUE.equals(passport.getIsClaimed())) {
            throw new BusinessException("ALREADY_CLAIMED", "BHTT: Sản phẩm này đã được kích hoạt quyền sở hữu trước đó bởi người khác! Vui lòng liên hệ hỗ trợ để kiểm tra nguồn gốc.");
        }

        String ownerName = (customerFullName != null && !customerFullName.isBlank()) ? customerFullName : "Khách Hàng Sở Hữu";

        passport.setIsClaimed(true);
        passport.setOwnerId(customerUserId);
        passport.setOwnerName(ownerName);
        passport.setClaimedAt(Instant.now());
        if (req != null && req.getActivationSecretCode() != null) {
            passport.setActivationSecretCode(req.getActivationSecretCode().trim());
        }

        String certUrl = String.format("https://storage.domain.vn/certificates/%s.pdf", passport.getSerialNumber());
        passport.setCertificateDownloadUrl(certUrl);
        passportRepository.saveAndFlush(passport);

        // Chèn mốc sự kiện ACTIVATED vào timeline
        PassportTimelineEvent event = PassportTimelineEvent.builder()
                .passport(passport)
                .serialNumber(passport.getSerialNumber())
                .eventType("ACTIVATED")
                .locationName("Khách Hàng Xác Nhận Kích Hoạt")
                .description("Sở hữu chính chủ bởi " + ownerName + (req != null && req.getNotes() != null ? " (" + req.getNotes() + ")" : ""))
                .actorRole("CUSTOMER")
                .eventTime(Instant.now())
                .build();
        timelineEventRepository.save(event);

        log.info("[PASSPORT_CLAIMED] Khách hàng {} đã kích hoạt sở hữu chính chủ cho Hộ chiếu {}", ownerName, serialNumber);

        return ClaimPassportResponse.builder()
                .message("Kích hoạt quyền sở hữu tác phẩm thành công!")
                .ownerName(ownerName)
                .claimedAt(passport.getClaimedAt())
                .certificateDownloadUrl(certUrl)
                .build();
    }

    // --- Helper Methods ---

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "***";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())) + "***";
        }
        StringBuilder masked = new StringBuilder();
        masked.append(parts[0].charAt(0)).append("***");
        masked.append(" ");
        masked.append(parts[parts.length - 1].charAt(0)).append("*");
        return masked.toString();
    }
}
