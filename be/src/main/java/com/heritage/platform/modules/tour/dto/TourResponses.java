package com.heritage.platform.modules.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class TourResponses {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse {
        private UUID tourId;
        private String title;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourDetailResponse {
        private UUID id;
        private String title;
        private String description;
        private BigDecimal pricePerPerson;
        private Double durationHours;
        private Integer maxSlotsPerSession;
        private String includedMaterials;
        private List<String> images;
        private String status;
        private String villageName;
        private Long villageId;
        private String artisanName;
        private Long artisanId;
    }
}
