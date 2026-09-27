package com.heritage.platform.modules.gis.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.gis.dto.CreateOrgUnitRequest;
import com.heritage.platform.modules.gis.dto.CreatePowerAssetRequest;
import com.heritage.platform.modules.gis.dto.OrgUnitTreeNode;
import com.heritage.platform.modules.gis.entity.OrgUnit;
import com.heritage.platform.modules.gis.entity.PowerAsset;
import com.heritage.platform.modules.gis.service.GisDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gis")
@RequiredArgsConstructor
public class GisDataController {

    private final GisDataService gisDataService;

    @GetMapping("/units/tree")
    public ApiResponse<List<OrgUnitTreeNode>> getOrgUnitTree() {
        return ApiResponse.ok(gisDataService.getOrgUnitTree(), "Tải cây đơn vị thành công");
    }

    @GetMapping("/units")
    public ApiResponse<List<OrgUnit>> getAllUnits() {
        return ApiResponse.ok(gisDataService.getAllUnits(), "Lấy danh sách đơn vị thành công");
    }

    @PostMapping("/units")
    public ApiResponse<OrgUnit> createUnit(@Valid @RequestBody CreateOrgUnitRequest request) {
        return ApiResponse.ok(gisDataService.createUnit(request), "Thêm đơn vị mới thành công");
    }

    @PutMapping("/units/{id}")
    public ApiResponse<OrgUnit> updateUnit(@PathVariable Long id, @Valid @RequestBody CreateOrgUnitRequest request) {
        return ApiResponse.ok(gisDataService.updateUnit(id, request), "Cập nhật đơn vị thành công");
    }

    @DeleteMapping("/units/{id}")
    public ApiResponse<String> deleteUnit(@PathVariable Long id) {
        gisDataService.deleteUnit(id);
        return ApiResponse.ok("success", "Xóa đơn vị thành công");
    }

    @GetMapping("/assets")
    public ApiResponse<PagedResponse<PowerAsset>> getAssets(
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) String unitCode,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(gisDataService.getAssets(assetType, unitCode, keyword, page, size), "Lấy danh sách thiết bị/tài sản thành công");
    }

    @GetMapping("/assets/counts")
    public ApiResponse<Map<String, Long>> getAssetCounts() {
        return ApiResponse.ok(gisDataService.getAssetCounts(), "Lấy thống kê số lượng tài sản thành công");
    }

    @PostMapping("/assets")
    public ApiResponse<PowerAsset> createAsset(@Valid @RequestBody CreatePowerAssetRequest request) {
        return ApiResponse.ok(gisDataService.createAsset(request), "Thêm tài sản/thiết bị thành công");
    }

    @PutMapping("/assets/{id}")
    public ApiResponse<PowerAsset> updateAsset(@PathVariable Long id, @Valid @RequestBody CreatePowerAssetRequest request) {
        return ApiResponse.ok(gisDataService.updateAsset(id, request), "Cập nhật tài sản/thiết bị thành công");
    }

    @DeleteMapping("/assets/{id}")
    public ApiResponse<String> deleteAsset(@PathVariable Long id) {
        gisDataService.deleteAsset(id);
        return ApiResponse.ok("success", "Xóa tài sản/thiết bị thành công");
    }
}
