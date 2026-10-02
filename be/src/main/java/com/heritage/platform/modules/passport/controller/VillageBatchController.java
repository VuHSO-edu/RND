package com.heritage.platform.modules.passport.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.passport.dto.BatchGenerateRequest;
import com.heritage.platform.modules.passport.dto.BatchGenerateResponse;
import com.heritage.platform.modules.passport.dto.BatchReviewRequest;
import com.heritage.platform.modules.passport.dto.RevokePassportRequest;
import com.heritage.platform.modules.passport.dto.TimelineEventRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportTimelineEvent;
import com.heritage.platform.modules.passport.entity.ProductBatch;
import com.heritage.platform.modules.passport.service.PassportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class VillageBatchController {

    private final PassportService passportService;

    /**
     * 1. C (Create) - Khởi tạo Hộ chiếu & Sinh mã QR hàng loạt theo Lô
     * Quyền hạn: VILLAGE_ADMIN
     */
    @PostMapping("/api/v1/villages/passports/batch-generate")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BatchGenerateResponse> generateBatch(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody BatchGenerateRequest request
    ) {
        BatchGenerateResponse response = passportService.generateBatchPassports(userId, request);
        return ApiResponse.ok(response, "Khởi tạo Lô sản phẩm và sinh mã QR hàng loạt thành công");
    }

    /**
     * 1. D (Delete) - Hủy bỏ / Thu hồi Hộ chiếu (Soft Delete / Revoke)
     * Quyền hạn: VILLAGE_ADMIN
     */
    @PutMapping("/api/v1/villages/passports/{serialNumber}/revoke")
    public ApiResponse<HeritagePassport> revokePassport(
            @PathVariable String serialNumber,
            @RequestBody(required = false) RevokePassportRequest request
    ) {
        String reason = (request != null && request.getRevocationReason() != null)
                ? request.getRevocationReason()
                : "Hiện vật bị hỏng trong quá trình vận chuyển";
        HeritagePassport revoked = passportService.revokePassport(serialNumber, reason);
        return ApiResponse.ok(revoked, "Thu hồi Hộ chiếu di sản thành công");
    }

    /**
     * 2. C/U - Tải lên & Cập nhật Video Quy trình Lô
     * Quyền hạn: ARTISAN, VILLAGE_ADMIN
     */
    @PutMapping("/api/v1/villages/batches/{batchId}/media")
    public ApiResponse<ProductBatch> updateBatchMedia(
            @PathVariable Long batchId,
            @RequestBody Map<String, String> body
    ) {
        String videoUrl = body.get("batchVideoUrl");
        if (videoUrl == null || videoUrl.isBlank()) {
            videoUrl = body.get("craftingVideoUrl");
        }
        ProductBatch updated = passportService.updateBatchMedia(batchId, videoUrl);
        return ApiResponse.ok(updated, "Cập nhật video quy trình chế tác của mẻ lò thành công");
    }

    /**
     * 2. D - Xóa Video Quy trình Lô khi ở trạng thái DRAFT / PENDING
     * Quyền hạn: ARTISAN, VILLAGE_ADMIN
     */
    @DeleteMapping("/api/v1/villages/batches/{batchId}/media")
    public ApiResponse<ProductBatch> deleteBatchMedia(@PathVariable Long batchId) {
        ProductBatch updated = passportService.deleteBatchMedia(batchId);
        return ApiResponse.ok(updated, "Xóa video quy trình của Lô sản phẩm thành công");
    }

    /**
     * 4. C - Duyệt Lô, tính Merkle Root & phát hành On-Chain
     * Quyền hạn: VILLAGE_ADMIN
     */
    @PutMapping("/api/v1/villages/batches/{batchId}/review")
    public ApiResponse<ProductBatch> reviewBatch(
            @PathVariable Long batchId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody BatchReviewRequest request
    ) {
        boolean isApproved = Boolean.TRUE.equals(request.getApproved()) 
                || "APPROVE".equalsIgnoreCase(request.getAction());

        ProductBatch reviewed = passportService.reviewBatch(
                batchId,
                userId,
                isApproved,
                request.getRejectionReason()
        );
        String message = isApproved
                ? "Duyệt Lô xuất xưởng thành công! Hệ thống đang băm Merkle Root và ghi sổ on-chain."
                : "Đã từ chối Lô sản phẩm xuất xưởng.";
        return ApiResponse.ok(reviewed, message);
    }

    /**
     * 5. C - Bổ sung Mốc Hành trình Mới (Supply Chain Timeline)
     * Quyền hạn: VILLAGE_ADMIN, System
     */
    @PostMapping("/api/v1/passports/{serialNumber}/timeline-events")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PassportTimelineEvent> addTimelineEvent(
            @PathVariable String serialNumber,
            @Valid @RequestBody TimelineEventRequest request
    ) {
        PassportTimelineEvent event = passportService.addTimelineEvent(serialNumber, request);
        return ApiResponse.ok(event, "Ghi nhận mốc sự kiện hành trình sản phẩm thành công");
    }

    /**
     * Lấy danh sách Lô chờ duyệt của làng
     */
    @GetMapping("/api/v1/villages/batches/pending")
    public ApiResponse<List<ProductBatch>> getPendingBatches(
            @RequestParam(required = false) Long villageId
    ) {
        List<ProductBatch> list = (villageId != null) 
                ? passportService.getPendingBatchesByVillage(villageId)
                : passportService.getPendingBatches();
        return ApiResponse.ok(list, "Lấy danh sách Lô sản phẩm chờ duyệt thành công");
    }

    /**
     * Lấy danh sách Lô của làng
     */
    @GetMapping("/api/v1/villages/batches")
    public ApiResponse<List<ProductBatch>> getBatches(
            @RequestParam(required = false, defaultValue = "1") Long villageId
    ) {
        List<ProductBatch> list = passportService.getBatchesByVillage(villageId);
        return ApiResponse.ok(list, "Lấy danh sách Lô sản phẩm thành công");
    }

    /**
     * Lấy danh sách Hộ chiếu con trong một Lô
     */
    @GetMapping("/api/v1/villages/batches/{batchId}/passports")
    public ApiResponse<List<HeritagePassport>> getBatchPassports(@PathVariable Long batchId) {
        List<HeritagePassport> list = passportService.getPassportsByBatch(batchId);
        return ApiResponse.ok(list, "Lấy danh sách Hộ chiếu theo Lô thành công");
    }
}
