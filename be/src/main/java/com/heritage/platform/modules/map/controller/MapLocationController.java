package com.heritage.platform.modules.map.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.map.dto.GeoJsonFeatureCollection;
import com.heritage.platform.modules.map.dto.ProposeLocationRequest;
import com.heritage.platform.modules.map.dto.ProposeLocationResponse;
import com.heritage.platform.modules.map.dto.ReviewMapLocationActionRequest;
import com.heritage.platform.modules.map.entity.MapLocation;
import com.heritage.platform.modules.map.service.MapLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MapLocationController {

    private final MapLocationService mapLocationService;

    /**
     * 1.2. [R] Lấy danh sách điểm văn hóa hiển thị lên bản đồ (GeoJSON FeatureCollection)
     */
    @GetMapping("/api/v1/map/locations")
    public GeoJsonFeatureCollection getLocations(
            @RequestParam(required = false) String bbox,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String craftType
    ) {
        // Hỗ trợ tham số bbox dạng "minLng,minLat,maxLng,maxLat"
        if (bbox != null && !bbox.isBlank()) {
            String[] parts = bbox.split(",");
            if (parts.length == 4) {
                try {
                    minLng = Double.parseDouble(parts[0].trim());
                    minLat = Double.parseDouble(parts[1].trim());
                    maxLng = Double.parseDouble(parts[2].trim());
                    maxLat = Double.parseDouble(parts[3].trim());
                } catch (NumberFormatException ignored) {}
            }
        }
        return mapLocationService.getGeoJsonLocations(minLng, minLat, maxLng, maxLat, category, craftType);
    }

    /**
     * 1.1. [C] Đề xuất điểm di sản / check-in mới
     */
    @PostMapping("/api/v1/map/locations/propose")
    public ResponseEntity<ProposeLocationResponse> proposeLocation(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ProposeLocationRequest request
    ) {
        ProposeLocationResponse response = mapLocationService.proposeLocation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 1.5. [R] Lấy danh sách điểm di sản do chính User đề xuất (My Proposals)
     */
    @GetMapping("/api/v1/map/locations/my-proposals")
    public ApiResponse<List<MapLocation>> getMyProposals(
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        List<MapLocation> list = mapLocationService.getMyProposals(userId);
        return ApiResponse.ok(list, "Lấy danh sách điểm đề xuất của tôi thành công");
    }

    /**
     * 1.3. [U] Phê duyệt / Từ chối điểm đề xuất trên Map bởi Quản lý làng hoặc Super Admin
     */
    @PutMapping({"/api/v1/villages/map/{id}/review", "/api/v1/admin/map/{id}/review"})
    public ApiResponse<ReviewMapLocationActionRequest.Response> reviewLocation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ReviewMapLocationActionRequest.Request request
    ) {
        ReviewMapLocationActionRequest.Response reviewed = mapLocationService.reviewLocationAction(id, userId, request.getAction(), request.getRejectionReason());
        return ApiResponse.ok(reviewed, "Đánh giá điểm di sản thành công");
    }

    /**
     * 1.4. [D] Gỡ bỏ / Ẩn điểm trên bản đồ (Soft-delete)
     */
    @DeleteMapping("/api/v1/villages/map/{id}")
    public ApiResponse<Map<String, Object>> deleteLocation(@PathVariable Long id) {
        mapLocationService.deleteLocation(id);
        return ApiResponse.ok(Map.of("success", true), "Điểm văn hóa đã được gỡ khỏi bản đồ công khai.");
    }
}
