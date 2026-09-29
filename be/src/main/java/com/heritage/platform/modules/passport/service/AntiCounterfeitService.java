package com.heritage.platform.modules.passport.service;

import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
public class AntiCounterfeitService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    @Value("${heritage.anti-counterfeit.impossible-speed-kmh:900.0}")
    private double maxPossibleSpeedKmh;

    @Value("${heritage.anti-counterfeit.impossible-distance-km:100.0}")
    private double thresholdDistanceKm;

    @Value("${heritage.anti-counterfeit.impossible-time-minutes:5.0}")
    private double thresholdTimeMinutes;

    public enum VerificationResult {
        NORMAL,
        SUSPICIOUS_WARNING, // Cảnh báo nghi vấn do IP/GeoIP lệch, KHÔNG khóa hộ chiếu
        COUNTERFEIT_BLOCKED // Cả 2 lần đều có GPS chính xác cao nhưng tốc độ bất khả thi -> Khóa hàng giả
    }

    public VerificationResult evaluateScanVelocity(
            PassportAuditLog lastScan,
            Double currentLat,
            Double currentLon,
            String currentAccuracyLevel,
            Instant currentScanTime
    ) {
        if (lastScan == null || lastScan.getLatitude() == null || lastScan.getLongitude() == null) {
            return VerificationResult.NORMAL;
        }
        if (currentLat == null || currentLon == null) {
            return VerificationResult.NORMAL;
        }

        double distanceKm = calculateHaversineDistance(
                lastScan.getLatitude(), lastScan.getLongitude(),
                currentLat, currentLon
        );

        long secondsDiff = Duration.between(lastScan.getScannedAt(), currentScanTime).getSeconds();
        if (secondsDiff <= 0) {
            secondsDiff = 1;
        }

        double hoursDiff = (double) secondsDiff / 3600.0;
        double speedKmh = distanceKm / hoursDiff;
        double minutesDiff = (double) secondsDiff / 60.0;

        boolean isImpossibleVelocity = speedKmh > maxPossibleSpeedKmh || (distanceKm > thresholdDistanceKm && minutesDiff < thresholdTimeMinutes);

        if (!isImpossibleVelocity) {
            return VerificationResult.NORMAL;
        }

        // Kiểm tra phân tầng độ chính xác vị trí (Tiered Geo-velocity Guard)
        boolean lastIsGps = "GPS_HIGH_ACCURACY".equalsIgnoreCase(lastScan.getAccuracyLevel());
        boolean currentIsGps = "GPS_HIGH_ACCURACY".equalsIgnoreCase(currentAccuracyLevel);

        if (lastIsGps && currentIsGps) {
            log.error("[HERITAGE_COUNTERFEIT_BLOCKED] Hai lần quét liên tiếp GPS chính xác cao vượt ngưỡng vật lý: Dist={} km, Time={} min, V={} km/h",
                    distanceKm, minutesDiff, speedKmh);
            return VerificationResult.COUNTERFEIT_BLOCKED;
        } else {
            log.warn("[HERITAGE_GEOIP_SUSPICIOUS] Vị trí nghi vấn do độ lệch IP/GeoIP (Dist={} km, V={} km/h). Ghi cảnh báo, không khóa thẻ.",
                    distanceKm, speedKmh);
            return VerificationResult.SUSPICIOUS_WARNING;
        }
    }

    public boolean isScanAnomaly(PassportAuditLog lastScan, Double currentLat, Double currentLon, Instant currentScanTime) {
        VerificationResult res = evaluateScanVelocity(lastScan, currentLat, currentLon, "GPS_HIGH_ACCURACY", currentScanTime);
        return res == VerificationResult.COUNTERFEIT_BLOCKED;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
