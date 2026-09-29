package com.heritage.platform.modules.map.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.map.dto.ProposeLocationRequest;
import com.heritage.platform.modules.map.dto.ReviewMapLocationRequest;
import com.heritage.platform.modules.map.entity.MapLocation;
import com.heritage.platform.modules.map.service.MapLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MapLocationController {

    private final MapLocationService mapLocationService;

    @GetMapping("/api/v1/map/locations")
    public ApiResponse<List<MapLocation>> getLocations(
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat
    ) {
        List<MapLocation> list = mapLocationService.getLocations(minLng, minLat, maxLng, maxLat);
        return ApiResponse.ok(list, "Lấy danh sách điểm di sản thành công");
    }

    @PostMapping("/api/v1/map/locations/propose")
    public ApiResponse<MapLocation> proposeLocation(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ProposeLocationRequest request
    ) {
        MapLocation created = mapLocationService.proposeLocation(userId, request);
        return ApiResponse.ok(created, "Đề xuất điểm di sản thành công");
    }

    @PutMapping("/api/v1/villages/map/{id}/review")
    public ApiResponse<MapLocation> reviewVillageLocation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ReviewMapLocationRequest request
    ) {
        MapLocation reviewed = mapLocationService.reviewLocation(id, userId, Boolean.TRUE.equals(request.getApproved()), request.getRejectionReason());
        return ApiResponse.ok(reviewed, "Đánh giá điểm di sản làng nghề thành công");
    }

    @PutMapping("/api/v1/admin/map/{id}/review")
    public ApiResponse<MapLocation> reviewAdminLocation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ReviewMapLocationRequest request
    ) {
        MapLocation reviewed = mapLocationService.reviewLocation(id, userId, Boolean.TRUE.equals(request.getApproved()), request.getRejectionReason());
        return ApiResponse.ok(reviewed, "Đánh giá điểm di sản toàn quốc thành công");
    }
}
