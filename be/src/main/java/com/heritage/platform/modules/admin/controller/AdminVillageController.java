package com.heritage.platform.modules.admin.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.admin.dto.VerifyVillageRequest;
import com.heritage.platform.modules.admin.service.AdminVillageService;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/villages")
@RequiredArgsConstructor
public class AdminVillageController {

    private final AdminVillageService adminVillageService;

    @GetMapping("/pending")
    public ApiResponse<List<CraftVillage>> getPendingVillages() {
        return ApiResponse.ok(adminVillageService.getPendingVillages(), "Lấy danh sách làng nghề chờ duyệt thành công");
    }

    @PutMapping("/{id}/verify")
    public ApiResponse<CraftVillage> verifyVillage(
            @PathVariable Long id,
            @Valid @RequestBody VerifyVillageRequest request
    ) {
        CraftVillage village = adminVillageService.verifyVillage(id, request);
        return ApiResponse.ok(village, "Cập nhật trạng thái duyệt làng nghề thành công");
    }
}
