package com.heritage.platform.modules.passport.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.util.HashUtils;
import com.heritage.platform.modules.passport.dto.BatchGenerateRequest;
import com.heritage.platform.modules.passport.dto.ScanSimulationRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.entity.ProductBatch;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.repository.PassportAuditLogRepository;
import com.heritage.platform.modules.passport.repository.ProductBatchRepository;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PassportService {

    private final HeritagePassportRepository passportRepository;
    private final ProductBatchRepository batchRepository;
    private final PassportAuditLogRepository auditLogRepository;
    private final ProductRepository productRepository;
    private final AntiCounterfeitService antiCounterfeitService;
    private final MerkleBlockchainService merkleBlockchainService;

    @Transactional(readOnly = true)
    public HeritagePassport getPassportByCode(String passportCode) {
        return passportRepository.findByPassportCode(passportCode)
                .or(() -> passportRepository.findBySerialNumber(passportCode))
                .or(() -> passportRepository.findByNfcTagUid(passportCode))
                .orElseThrow(() -> new BusinessException("PASSPORT_NOT_FOUND", "Mã Hộ chiếu di sản không tồn tại trên hệ thống"));
    }

    @Transactional(readOnly = true)
    public List<PassportAuditLog> getAuditLogs(String passportCode) {
        HeritagePassport passport = getPassportByCode(passportCode);
        return auditLogRepository.findTop20ByPassportIdOrderByScannedAtDesc(passport.getId());
    }

    @Transactional(readOnly = true)
    public HeritagePassport getPassportByProductId(Long productId) {
        return passportRepository.findByProductId(productId)
                .orElseThrow(() -> new BusinessException("PASSPORT_NOT_FOUND", "Tác phẩm này chưa được cấp Hộ chiếu di sản"));
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
     * Tạo Lô sản phẩm và sinh hàng loạt Hộ chiếu di sản (Batch Generate)
     */
    @Transactional
    public ProductBatch generateBatchPassports(Long villageAdminUserId, BatchGenerateRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Mẫu SKU sản phẩm không tồn tại"));

        CraftVillage village = product.getCraftVillage();
        if (village == null && product.getArtisan() != null) {
            village = product.getArtisan().getCraftVillage();
        }

        int year = Year.now().getValue();
        String villagePrefix = (village != null && village.getSlug() != null)
                ? village.getSlug().replace("lang-", "").replace("-", "").toUpperCase()
                : "BAT";
        if (villagePrefix.length() > 4) {
            villagePrefix = villagePrefix.substring(0, 4);
        }

        String batchCode = "BAT-" + villagePrefix + "-" + year + "-" + System.currentTimeMillis() % 100000;

        ProductBatch batch = ProductBatch.builder()
                .batchCode(batchCode)
                .product(product)
                .craftVillage(village)
                .artisan(product.getArtisan())
                .quantity(req.getQuantity())
                .approvalStatus("PENDING")
                .onchainStatus("NOT_COMMITTED")
                .batchNotes(req.getBatchNotes())
                .productionDate(req.getProductionDate() != null ? req.getProductionDate() : Instant.now())
                .build();

        batch = batchRepository.saveAndFlush(batch);

        List<HeritagePassport> passports = new ArrayList<>();
        for (int i = 1; i <= req.getQuantity(); i++) {
            String serialNumber = String.format("HP-%s-%d-%04d", villagePrefix, year, i + (System.currentTimeMillis() % 1000) * 10);
            String passportCode = "VN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // Tính toán SHA-256 lá Merkle
            String rawData = (product.getArtisan() != null ? product.getArtisan().getId() : 0) + ":"
                    + product.getId() + ":" + serialNumber + ":" + System.nanoTime();
            String verificationHash = HashUtils.sha256(rawData);

            HeritagePassport passport = HeritagePassport.builder()
                    .product(product)
                    .batch(batch)
                    .passportCode(passportCode)
                    .serialNumber(serialNumber)
                    .craftingVideoUrl(req.getCraftingVideoUrl() != null ? req.getCraftingVideoUrl() : product.getCreationProcessVideoUrl())
                    .artisanStoryQuote(req.getArtisanStoryQuote() != null ? req.getArtisanStoryQuote() : product.getArtisanStory())
                    .verificationHash(verificationHash)
                    .status("PENDING_APPROVAL")
                    .scanCount(0)
                    .smartContractAddress("0x71a2B889cFe49D1e5e78B2c56a88F932De7189cF")
                    .build();

            passports.add(passport);
        }

        passportRepository.saveAllAndFlush(passports);
        log.info("[BATCH_GENERATED] Đã sinh Lô hàng {} gồm {} hộ chiếu di sản", batchCode, req.getQuantity());
        return batch;
    }

    /**
     * Phê duyệt Lô sản phẩm bởi Village Admin
     * Bọc tác vụ Merkle Tree & Polygon Blockchain vào @Async Service
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

        // Trường hợp Duyệt thành công (APPROVED)
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
     * Gắn mã chip NFC vật lý vào Hộ chiếu di sản (Dual-path binding)
     */
    @Transactional
    public HeritagePassport bindNfc(String passportCode, String nfcTagUid) {
        if (nfcTagUid == null || nfcTagUid.trim().isEmpty()) {
            throw new BusinessException("NFC_UID_EMPTY", "Mã chip NFC không được để trống");
        }
        String cleanUid = nfcTagUid.trim().toUpperCase();

        Optional<HeritagePassport> existing = passportRepository.findByNfcTagUid(cleanUid);
        if (existing.isPresent() && !existing.get().getPassportCode().equalsIgnoreCase(passportCode)) {
            throw new BusinessException("NFC_ALREADY_BOUND", "Mã chip NFC này đã được gắn cho một Hộ chiếu di sản khác");
        }

        HeritagePassport passport = getPassportByCode(passportCode);
        passport.setNfcTagUid(cleanUid);
        log.info("[NFC_BIND_SUCCESS] Gắn thành công chip NFC {} cho Hộ chiếu {}", cleanUid, passport.getPassportCode());
        return passportRepository.save(passport);
    }

    /**
     * Quét mã xác thực với cơ chế chống giả đa tầng (Tiered Geo-velocity Guard)
     */
    @Transactional
    public HeritagePassport processScan(String passportCode, ScanSimulationRequest scanReq, String clientIp, String userAgent) {
        HeritagePassport passport = getPassportByCode(passportCode);

        Optional<PassportAuditLog> optLastScan = auditLogRepository.findFirstByPassportIdOrderByScannedAtDesc(passport.getId());
        Instant now = Instant.now();

        String accuracyLevel = scanReq.getAccuracyLevel() != null ? scanReq.getAccuracyLevel() : "GPS_HIGH_ACCURACY";
        Double latitude = scanReq.getLatitude();
        Double longitude = scanReq.getLongitude();
        Double accuracyMeters = scanReq.getAccuracyMeters();
        String city = scanReq.getCity() != null ? scanReq.getCity() : "Việt Nam";
        String country = scanReq.getCountry() != null ? scanReq.getCountry() : "VN";

        AntiCounterfeitService.VerificationResult verification = AntiCounterfeitService.VerificationResult.NORMAL;
        if (optLastScan.isPresent() && latitude != null && longitude != null) {
            verification = antiCounterfeitService.evaluateScanVelocity(optLastScan.get(), latitude, longitude, accuracyLevel, now);
        }

        boolean isAnomaly = (verification == AntiCounterfeitService.VerificationResult.COUNTERFEIT_BLOCKED);
        String warningNote = null;

        if (verification == AntiCounterfeitService.VerificationResult.COUNTERFEIT_BLOCKED) {
            passport.setStatus("BLOCKED_COUNTERFEIT");
            warningNote = "PHÁT HIỆN TỐC ĐỘ DI CHUYỂN BẤT KHẢ THI (GPS CHÍNH XÁC CAO)";
            log.error("[ALERT_COUNTERFEIT_BLOCKED] Hộ chiếu {} bị khóa do tốc độ bất khả thi.", passportCode);
        } else if (verification == AntiCounterfeitService.VerificationResult.SUSPICIOUS_WARNING) {
            warningNote = "CẢNH BÁO TỐC ĐỘ NGHI VẤN DO ĐỘ LỆCH MẠNG IP (KHÔNG KHÓA THẺ)";
            log.warn("[ALERT_GEOIP_SUSPICIOUS] Hộ chiếu {} ghi nhận cảnh báo sai lệch IP, thẻ vẫn hoạt động.", passportCode);
        }

        PassportAuditLog logEntry = PassportAuditLog.builder()
                .passport(passport)
                .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                .userAgent(userAgent != null ? userAgent : "Browser Mobile/Desktop")
                .latitude(latitude)
                .longitude(longitude)
                .accuracyLevel(accuracyLevel)
                .accuracyMeters(accuracyMeters)
                .city(city)
                .country(country)
                .isAnomaly(isAnomaly)
                .warningNote(warningNote)
                .build();

        auditLogRepository.save(logEntry);

        passport.setScanCount(passport.getScanCount() + 1);
        return passportRepository.save(passport);
    }
}
