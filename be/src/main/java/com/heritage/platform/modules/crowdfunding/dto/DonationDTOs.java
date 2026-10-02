package com.heritage.platform.modules.crowdfunding.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class DonationDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonateRequest {
        @NotBlank(message = "Tên người ủng hộ không được để trống")
        private String donorName;

        private String donorEmail;

        @NotNull(message = "Số tiền ủng hộ không được để trống")
        @DecimalMin(value = "10000.0", message = "Số tiền ủng hộ tối thiểu là 10.000 VNĐ")
        private BigDecimal amount;

        @Builder.Default
        private Boolean isAnonymous = false;

        private String message;

        private String tierId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonationResponse {
        private UUID donationId;
        private String paymentStatus;
        private BigDecimal amount;
        private String thankYouMessage;
        private String vietQrPayload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotBlank(message = "Trạng thái mới không được để trống")
        private String status; // COMPLETED, EXPIRED, CLOSED, ACTIVE
    }
}
