package com.heritage.platform.modules.village.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVillageProfileRequest {

    private String name;
    private String craftType;
    private String region;
    private String province;
    private String district;
    private String addressLine;
    private String historicalSummary;
    private Integer foundingYearEstimate;
    private String ancestorWorshipInfo;
    private Double latitude;
    private Double longitude;
    private Integer coverageRadiusMeters;
    private String coverImageUrl;
}
