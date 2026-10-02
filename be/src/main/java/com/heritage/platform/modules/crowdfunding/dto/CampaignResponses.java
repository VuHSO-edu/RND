package com.heritage.platform.modules.crowdfunding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CampaignResponses {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse {
        private UUID campaignId;
        private String status;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampaignSummaryResponse {
        private UUID id;
        private String title;
        private String coverImageUrl;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private Double progressPercentage;
        private Integer donorsCount;
        private Long daysRemaining;
        private String status;
        private String fundingType;
        private String villageName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampaignDetailResponse {
        private UUID id;
        private String title;
        private String storyContent;
        private String coverImageUrl;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private Double progressPercentage;
        private Integer donorsCount;
        private Long daysRemaining;
        private LocalDate startDate;
        private LocalDate deadline;
        private String fundingType;
        private String status;
        private VillageInfo village;
        private ArtisanInfo artisan;
        private List<Object> rewardTiers;
        private List<RecentDonationDTO> recentDonations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VillageInfo {
        private Long id;
        private String name;
        private String province;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtisanInfo {
        private Long id;
        private String name;
        private String title;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentDonationDTO {
        private String donorName;
        private BigDecimal amount;
        private String message;
        private Instant donatedAt;
    }
}
