package com.heritage.platform.modules.tour.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class TourBookingDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        @NotNull(message = "Mã khóa học/tour không được để trống")
        private UUID tourId;

        @NotNull(message = "Ngày đặt tour không được để trống")
        private LocalDate bookingDate;

        @NotBlank(message = "Khung giờ (MORNING hoặc AFTERNOON) không được để trống")
        private String sessionTime; // MORNING, AFTERNOON

        @NotNull(message = "Số lượng khách tham gia không được để trống")
        @Min(value = 1, message = "Số lượng khách tối thiểu là 1 người")
        private Integer numberOfGuests;

        @NotBlank(message = "Số điện thoại liên hệ không được để trống")
        private String contactPhone;

        private String customerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private UUID bookingId;
        private BigDecimal totalAmount;
        private String ticketQrCode;
        private String qrTicketUrl;
        private String session;
        private String paymentStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyTicketRequest {
        @NotBlank(message = "Mã QR vé không được để trống")
        private String ticketQrCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyTicketResponse {
        private boolean valid;
        private String customerName;
        private Integer guestsCount;
        private String tourName;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelBookingResponse {
        private boolean success;
        private UUID bookingId;
        private String message;
        private BigDecimal refundAmount;
    }
}
