package com.heritage.platform.modules.passport.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.passport.dto.BatchGenerateRequest;
import com.heritage.platform.modules.passport.dto.BatchReviewRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.ProductBatch;
import com.heritage.platform.modules.passport.service.PassportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VillageBatchController {

    private final PassportService passportService;

    @PostMapping("/api/v1/villages/passports/batch-generate")
    public ApiResponse<ProductBatch> generateBatch(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody BatchGenerateRequest request
    ) {
        ProductBatch batch = passportService.generateBatchPassports(userId, request);
        return ApiResponse.ok(batch, "Khởi tạo Lô sản phẩm và sinh danh sách Hộ chiếu thành công");
    }

    @GetMapping("/api/v1/villages/batches/pending")
    public ApiResponse<List<ProductBatch>> getPendingBatches(
            @RequestParam(required = false) Long villageId
    ) {
        List<ProductBatch> list = (villageId != null) 
                ? passportService.getPendingBatchesByVillage(villageId)
                : passportService.getPendingBatches();
        return ApiResponse.ok(list, "Lấy danh sách Lô sản phẩm chờ duyệt thành công");
    }

    @GetMapping("/api/v1/villages/batches")
    public ApiResponse<List<ProductBatch>> getBatches(
            @RequestParam(required = false, defaultValue = "1") Long villageId
    ) {
        List<ProductBatch> list = passportService.getBatchesByVillage(villageId);
        return ApiResponse.ok(list, "Lấy danh sách Lô sản phẩm thành công");
    }

    @GetMapping("/api/v1/villages/batches/{batchId}/passports")
    public ApiResponse<List<HeritagePassport>> getBatchPassports(
            @PathVariable Long batchId
    ) {
        List<HeritagePassport> list = passportService.getPassportsByBatch(batchId);
        return ApiResponse.ok(list, "Lấy danh sách Hộ chiếu theo Lô thành công");
    }

    @PutMapping("/api/v1/villages/batches/{batchId}/review")
    public ApiResponse<ProductBatch> reviewBatch(
            @PathVariable Long batchId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody BatchReviewRequest request
    ) {
        ProductBatch reviewed = passportService.reviewBatch(
                batchId,
                userId,
                Boolean.TRUE.equals(request.getApproved()),
                request.getRejectionReason()
        );
        String message = Boolean.TRUE.equals(request.getApproved())
                ? "Duyệt Lô xuất xưởng thành công! Hệ thống đang băm Merkle Root và ghi sổ on-chain."
                : "Đã từ chối Lô sản phẩm xuất xưởng.";
        return ApiResponse.ok(reviewed, message);
    }
}
