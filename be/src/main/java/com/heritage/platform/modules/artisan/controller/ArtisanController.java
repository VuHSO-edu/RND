package com.heritage.platform.modules.artisan.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.artisan.dto.ArtisanPublicProfileResponse;
import com.heritage.platform.modules.artisan.dto.CreateArtisanRequest;
import com.heritage.platform.modules.artisan.dto.UpdateArtisanProfileRequest;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.service.ArtisanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ArtisanController {

    private final ArtisanService artisanService;

    @GetMapping("/api/v1/public/artisans")
    public ApiResponse<List<ArtisanProfile>> getArtisans() {
        return ApiResponse.ok(artisanService.getVerifiedArtisans(), "Lấy danh sách nghệ nhân thành công");
    }

    @GetMapping({"/api/v1/public/artisans/{id}", "/api/v1/artisans/{id}"})
    public ApiResponse<ArtisanProfile> getArtisanById(@PathVariable Long id) {
        return ApiResponse.ok(artisanService.getArtisanById(id), "Lấy thông tin chi tiết nghệ nhân thành công");
    }

    /**
     * R (Read) - Xem Hồ sơ Nghệ nhân công khai kèm media phỏng vấn & tác phẩm
     */
    @GetMapping({"/api/v1/artisans/{artisanId}/public-profile", "/api/v1/public/artisans/{artisanId}/public-profile"})
    public ApiResponse<ArtisanPublicProfileResponse> getPublicProfile(@PathVariable Long artisanId) {
        return ApiResponse.ok(artisanService.getPublicProfile(artisanId), "Lấy hồ sơ nghệ nhân và media phỏng vấn thành công");
    }

    /**
     * C (Create) - Tạo Hồ sơ Nghệ nhân
     */
    @PostMapping("/api/v1/artisans")
    public ApiResponse<ArtisanProfile> createArtisan(
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody CreateArtisanRequest request
    ) {
        ArtisanProfile created = artisanService.createArtisanProfile(adminUserId, request);
        return ApiResponse.ok(created, "Tạo hồ sơ nghệ nhân và chứng thực làng nghề thành công");
    }

    /**
     * U (Update) - Nghệ nhân tự cập nhật triết lý & nội dung phỏng vấn
     */
    @PutMapping("/api/v1/artisans/profile")
    public ApiResponse<ArtisanProfile> updateMyProfile(
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long userId,
            @Valid @RequestBody UpdateArtisanProfileRequest request
    ) {
        ArtisanProfile updated = artisanService.updateArtisanProfile(userId, request);
        return ApiResponse.ok(updated, "Cập nhật tiểu sử và triết lý làm nghề thành công");
    }
}
