package com.heritage.platform.modules.tour.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.tour.dto.TourBookingDTOs;
import com.heritage.platform.modules.tour.service.HeritageTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class CustomerTourController {

    private final HeritageTourService tourService;

    /**
     * 3.3. [C/Action] Đặt tour & Giữ chỗ 15 phút nhận Vé QR (Booking)
     */
    @PostMapping("/book")
    public ResponseEntity<TourBookingDTOs.BookingResponse> bookTour(
            @RequestHeader(value = "X-User-Id", required = false) Long customerUserId,
            @Valid @RequestBody TourBookingDTOs.BookingRequest request
    ) {
        TourBookingDTOs.BookingResponse response = tourService.bookTour(customerUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 3.6. [MỚI] Khách hàng tự hủy vé và hoàn tiền trước >= 24h
     */
    @PutMapping("/bookings/{bookingId}/cancel")
    public ApiResponse<TourBookingDTOs.CancelBookingResponse> cancelBooking(
            @PathVariable UUID bookingId,
            @RequestHeader(value = "X-User-Id", required = false) Long customerUserId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        TourBookingDTOs.CancelBookingResponse response = tourService.cancelBooking(bookingId, customerUserId, reason);
        return ApiResponse.ok(response, "Hủy vé thành công và kích hoạt hoàn tiền tự động");
    }
}
