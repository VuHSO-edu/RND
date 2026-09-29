package com.heritage.platform.modules.passport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanSimulationRequest {
    private String passportCode;
    private Double latitude;
    private Double longitude;
    private String accuracyLevel; // GPS_HIGH_ACCURACY, GEOIP_LOW_ACCURACY
    private Double accuracyMeters;
    private String city;
    private String country;
    private String ipAddress;
}
