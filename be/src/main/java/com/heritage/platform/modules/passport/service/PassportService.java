package com.heritage.platform.modules.passport.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.util.HashUtils;
import com.heritage.platform.modules.passport.dto.ScanSimulationRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.repository.PassportAuditLogRepository;
import com.heritage.platform.modules.product.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PassportService {

    private final HeritagePassportRepository passportRepository;
    private final PassportAuditLogRepository auditLogRepository;
    private final AntiCounterfeitService antiCounterfeitService;

    @Transactional(readOnly = true)
    public HeritagePassport getPassportByCode(String passportCode) {
        return passportRepository.findByPassportCode(passportCode)
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

    @Transactional
    public HeritagePassport processScan(String passportCode, String ipAddress, String userAgent, Double latitude, Double longitude, String city, String country) {
        HeritagePassport passport = getPassportByCode(passportCode);

        Optional<PassportAuditLog> optLastScan = auditLogRepository.findFirstByPassportIdOrderByScannedAtDesc(passport.getId());
        Instant now = Instant.now();

        boolean isAnomaly = false;
        if (optLastScan.isPresent() && latitude != null && longitude != null) {
            isAnomaly = antiCounterfeitService.isScanAnomaly(optLastScan.get(), latitude, longitude, now);
        }

        PassportAuditLog logEntry = PassportAuditLog.builder()
                .passport(passport)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .userAgent(userAgent != null ? userAgent : "Browser Mobile/Desktop")
                .latitude(latitude)
                .longitude(longitude)
                .city(city != null ? city : "Việt Nam")
                .country(country != null ? country : "VN")
                .isAnomaly(isAnomaly)
                .build();

        auditLogRepository.save(logEntry);

        passport.setScanCount(passport.getScanCount() + 1);
        if (isAnomaly) {
            passport.setStatus("FLAGGED_ANOMALY");
            log.warn("[ALERT_COUNTERFEIT_DETECTED] PassportCode={}, City={}, IsAnomaly=TRUE", passportCode, city);
        }
        return passportRepository.save(passport);
    }

    @Transactional
    public HeritagePassport createPassportForProduct(Product product, String craftingVideoUrl, String storyQuote) {
        if (passportRepository.findByProductId(product.getId()).isPresent()) {
            throw new BusinessException("PASSPORT_ALREADY_EXISTS", "Tác phẩm đã có Hộ chiếu di sản");
        }

        String passportCode = "VN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant now = Instant.now();

        // Tính toán chuỗi băm bất biến SHA-256
        String rawData = product.getArtisan().getId() + ":" + product.getId() + ":" + now.toEpochMilli();
        String verificationHash = HashUtils.sha256(rawData);

        HeritagePassport passport = HeritagePassport.builder()
                .product(product)
                .passportCode(passportCode)
                .craftingVideoUrl(craftingVideoUrl)
                .artisanStoryQuote(storyQuote)
                .verificationHash(verificationHash)
                .blockchainTxHash("0x" + UUID.randomUUID().toString().replace("-", "") + "7f")
                .smartContractAddress("0x71a2B889cFe49D1e5e78B2c56a88F932De7189cF")
                .blockchainTokenId(String.valueOf(System.currentTimeMillis() % 1000000))
                .status("ACTIVE")
                .scanCount(0)
                .build();

        return passportRepository.save(passport);
    }
}
