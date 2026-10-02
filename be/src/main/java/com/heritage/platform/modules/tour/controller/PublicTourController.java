package com.heritage.platform.modules.tour.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.tour.dto.TourResponses;
import com.heritage.platform.modules.tour.service.HeritageTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class PublicTourController {

    private final HeritageTourService tourService;

    /**
     * 3.2. [R] Tra cứu danh sách Tour đang mở đón khách
     */
    @GetMapping
    public ApiResponse<List<TourResponses.TourDetailResponse>> getTours(
            @RequestParam(required = false) Long villageId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        List<TourResponses.TourDetailResponse> list = tourService.getTours(villageId, minPrice, maxPrice);
        return ApiResponse.ok(list, "Lấy danh sách tour trải nghiệm thành công");
    }

    /**
     * 3.2. [R] Chi tiết Tour trải nghiệm
     */
    @GetMapping("/{id}")
    public ApiResponse<TourResponses.TourDetailResponse> getTourById(@PathVariable UUID id) {
        TourResponses.TourDetailResponse tour = tourService.getTourById(id);
        return ApiResponse.ok(tour, "Lấy chi tiết khóa học/tour thành công");
    }
}
