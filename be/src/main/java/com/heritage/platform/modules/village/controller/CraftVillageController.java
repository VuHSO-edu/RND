package com.heritage.platform.modules.village.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.village.dto.CreateVillageRequest;
import com.heritage.platform.modules.village.dto.VillageTreeNode;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.service.CraftVillageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/villages")
@RequiredArgsConstructor
public class CraftVillageController {

    private final CraftVillageService craftVillageService;

    @GetMapping
    public ApiResponse<List<CraftVillage>> getAllVillages() {
        return ApiResponse.ok(craftVillageService.getAllActiveVillages(), "Lấy danh sách làng nghề thành công");
    }

    @GetMapping("/tree")
    public ApiResponse<List<VillageTreeNode>> getVillageTree() {
        return ApiResponse.ok(craftVillageService.getVillageTree(), "Lấy cây di sản làng nghề thành công");
    }

    @GetMapping("/{slug}")
    public ApiResponse<CraftVillage> getVillageBySlug(@PathVariable String slug) {
        return ApiResponse.ok(craftVillageService.getVillageBySlug(slug), "Lấy thông tin chi tiết làng nghề thành công");
    }

    @GetMapping("/region/{region}")
    public ApiResponse<List<CraftVillage>> getVillagesByRegion(@PathVariable String region) {
        return ApiResponse.ok(craftVillageService.getVillagesByRegion(region), "Lọc làng nghề theo vùng miền thành công");
    }

    @PostMapping
    public ApiResponse<CraftVillage> createVillage(@Valid @RequestBody CreateVillageRequest request) {
        return ApiResponse.ok(craftVillageService.createVillage(request), "Thêm mới làng nghề thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<CraftVillage> updateVillage(@PathVariable Long id, @Valid @RequestBody CreateVillageRequest request) {
        return ApiResponse.ok(craftVillageService.updateVillage(id, request), "Cập nhật làng nghề thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteVillage(@PathVariable Long id) {
        craftVillageService.deleteVillage(id);
        return ApiResponse.ok("success", "Xóa làng nghề thành công");
    }
}
