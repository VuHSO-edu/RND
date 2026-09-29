package com.heritage.platform.modules.village.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.village.dto.ProxyArtisanCreateRequest;
import com.heritage.platform.modules.village.dto.ProxyArtisanResponse;
import com.heritage.platform.modules.village.dto.ReviewArtisanRequest;
import com.heritage.platform.modules.village.dto.UpdateVillageProfileRequest;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.service.VillageAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/villages")
@RequiredArgsConstructor
public class VillageAdminController {

    private final VillageAdminService villageAdminService;

    @GetMapping("/me")
    public ApiResponse<CraftVillage> getMyVillage(
            @RequestParam(required = false) Long villageId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        CraftVillage village = villageAdminService.getVillageForAdmin(userId, villageId);
        return ApiResponse.ok(village, "Lấy thông tin làng nghề thành công");
    }

    @PutMapping("/me")
    public ApiResponse<CraftVillage> updateMyVillage(
            @RequestParam(required = false) Long villageId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody UpdateVillageProfileRequest request
    ) {
        CraftVillage currentVillage = villageAdminService.getVillageForAdmin(userId, villageId);
        CraftVillage updated = villageAdminService.updateVillageProfile(currentVillage.getId(), request);
        return ApiResponse.ok(updated, "Cập nhật hồ sơ làng nghề thành công");
    }

    @GetMapping("/artisans")
    public ApiResponse<List<ArtisanProfile>> getArtisans(
            @RequestParam(required = false) Long villageId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        CraftVillage currentVillage = villageAdminService.getVillageForAdmin(userId, villageId);
        List<ArtisanProfile> list = villageAdminService.getArtisansForVillage(currentVillage.getId());
        return ApiResponse.ok(list, "Lấy danh sách nghệ nhân thành công");
    }

    @PostMapping("/artisans")
    public ApiResponse<ProxyArtisanResponse> createProxyArtisan(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ProxyArtisanCreateRequest request
    ) {
        ProxyArtisanResponse response = villageAdminService.createProxyArtisan(userId, request);
        return ApiResponse.ok(response, "Tạo tài khoản đại diện nghệ nhân thành công");
    }

    @PutMapping("/artisans/{id}/review")
    public ApiResponse<ArtisanProfile> reviewArtisan(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ReviewArtisanRequest request
    ) {
        ArtisanProfile updated = villageAdminService.reviewArtisan(id, userId, request);
        return ApiResponse.ok(updated, "Đánh giá hồ sơ nghệ nhân thành công");
    }

    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics(
            @RequestParam(required = false) Long villageId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        CraftVillage currentVillage = villageAdminService.getVillageForAdmin(userId, villageId);
        List<ArtisanProfile> artisans = villageAdminService.getArtisansForVillage(currentVillage.getId());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("villageId", currentVillage.getId());
        stats.put("villageName", currentVillage.getName());
        stats.put("totalArtisans", artisans.size());
        stats.put("approvedArtisans", artisans.stream().filter(a -> "APPROVED".equals(a.getVerificationStatus()) || "VERIFIED".equals(a.getVerificationStatus())).count());
        stats.put("pendingArtisans", artisans.stream().filter(a -> "PENDING".equals(a.getVerificationStatus())).count());
        stats.put("coverageRadiusMeters", currentVillage.getCoverageRadiusMeters());
        stats.put("verificationStatus", currentVillage.getVerificationStatus());

        return ApiResponse.ok(stats, "Lấy số liệu thống kê làng nghề thành công");
    }
}
