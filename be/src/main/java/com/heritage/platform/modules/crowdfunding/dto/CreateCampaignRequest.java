package com.heritage.platform.modules.crowdfunding.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampaignRequest {

    private Long craftVillageId;

    private Long targetArtisanId;

    @NotBlank(message = "Tiêu đề chiến dịch gây quỹ không được để trống")
    private String title;

    @NotBlank(message = "Nội dung câu chuyện bảo tồn không được để trống")
    private String storyContent;

    private String coverImageUrl;

    @NotNull(message = "Số tiền mục tiêu không được để trống")
    @DecimalMin(value = "100000.0", message = "Mục tiêu gây quỹ tối thiểu là 100.000 VNĐ")
    private BigDecimal targetAmount;

    @NotNull(message = "Ngày bắt đầu gây quỹ không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Hạn chót gây quỹ không được để trống")
    private LocalDate deadline;

    @Builder.Default
    private String fundingType = "ALL_OR_NOTHING"; // ALL_OR_NOTHING, FLEXIBLE

    private List<RewardTierDTO> rewardTiers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewardTierDTO {
        private String tierId;
        private BigDecimal minAmount;
        private String rewardTitle;
        private String description;
    }
}
