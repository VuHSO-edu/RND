package com.heritage.platform.modules.tour.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.tour.dto.CreateTourRequest;
import com.heritage.platform.modules.tour.dto.TourBookingDTOs;
import com.heritage.platform.modules.tour.dto.TourResponses;
import com.heritage.platform.modules.tour.service.HeritageTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class VillageTourController {

    private final HeritageTourService tourService;

    /**
     * 3.1. [C] Tạo Tour trải nghiệm mới
     */
    @PostMapping("/api/v1/villages/tours")
    public ResponseEntity<TourResponses.CreateResponse> createTour(
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody CreateTourRequest request
    ) {
        TourResponses.CreateResponse response = tourService.createTour(adminUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 3.5. [U] Cập nhật / Tạm dừng Tour
     */
    @PutMapping("/api/v1/villages/tours/{tourId}")
    public ApiResponse<TourResponses.CreateResponse> updateTour(
            @PathVariable UUID tourId,
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody CreateTourRequest request
    ) {
        TourResponses.CreateResponse response = tourService.updateTour(tourId, adminUserId, request);
        return ApiResponse.ok(response, "Cập nhật tour trải nghiệm thành công");
    }

    /**
     * 3.5. [D] Xóa Tour (Chỉ xóa được khi chưa có khách đặt vé trong tương lai)
     */
    @DeleteMapping("/api/v1/villages/tours/{tourId}")
    public ApiResponse<Map<String, Object>> deleteTour(@PathVariable UUID tourId) {
        tourService.deleteTour(tourId);
        return ApiResponse.ok(Map.of("success", true), "Khóa học/tour trải nghiệm đã được gỡ bỏ.");
    }

    /**
     * 3.4. [U/Action] Quét soát vé tại xưởng trải nghiệm bằng Camera
     */
    @PostMapping("/api/v1/tours/verify-ticket")
    public ApiResponse<TourBookingDTOs.VerifyTicketResponse> verifyTicket(
            @Valid @RequestBody TourBookingDTOs.VerifyTicketRequest request
    ) {
        TourBookingDTOs.VerifyTicketResponse response = tourService.verifyTicket(request);
        return ApiResponse.ok(response, response.getMessage());
    }
}
