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

    public boolean isScanAnomaly(PassportAuditLog lastScan, Double currentLat, Double currentLon, Instant currentScanTime) {
        if (lastScan == null || lastScan.getLatitude() == null || lastScan.getLongitude() == null) {
            return false;
        }
        if (currentLat == null || currentLon == null) {
            return false;
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

        if (speedKmh > maxPossibleSpeedKmh || (distanceKm > thresholdDistanceKm && minutesDiff < thresholdTimeMinutes)) {
            log.warn("[HERITAGE_COUNTERFEIT_ALERT] Detected impossible travel velocity: Distance={} km, Time={} mins, Speed={} km/h",
                    distanceKm, minutesDiff, speedKmh);
            return true;
        }

        return false;
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
