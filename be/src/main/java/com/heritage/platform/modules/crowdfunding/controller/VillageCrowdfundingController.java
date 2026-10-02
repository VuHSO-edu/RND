package com.heritage.platform.modules.crowdfunding.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.crowdfunding.dto.CampaignResponses;
import com.heritage.platform.modules.crowdfunding.dto.CreateCampaignRequest;
import com.heritage.platform.modules.crowdfunding.dto.DonationDTOs;
import com.heritage.platform.modules.crowdfunding.service.CrowdfundingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/villages/crowdfunding")
@RequiredArgsConstructor
public class VillageCrowdfundingController {

    private final CrowdfundingService crowdfundingService;

    /**
     * 4.1. [C] Khởi tạo chiến dịch gây quỹ bảo tồn mới
     */
    @PostMapping
    public ResponseEntity<CampaignResponses.CreateResponse> createCampaign(
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody CreateCampaignRequest request
    ) {
        CampaignResponses.CreateResponse response = crowdfundingService.createCampaign(adminUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 4.4. [U] Cập nhật trạng thái chiến dịch gây quỹ (COMPLETED, EXPIRED, CLOSED, ACTIVE)
     */
    @PutMapping("/{id}/status")
    public ApiResponse<Map<String, Object>> updateCampaignStatus(
            @PathVariable UUID id,
            @Valid @RequestBody DonationDTOs.UpdateStatusRequest request
    ) {
        crowdfundingService.updateCampaignStatus(id, request.getStatus());
        return ApiResponse.ok(Map.of("success", true), "Cập nhật trạng thái chiến dịch thành công");
    }

    /**
     * 4.4. [D] Xóa mềm chiến dịch gây quỹ (Chỉ xóa được khi chưa có tiền quyên góp)
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> deleteCampaign(@PathVariable UUID id) {
        crowdfundingService.deleteCampaign(id);
        return ApiResponse.ok(Map.of("success", true), "Đã xóa mềm chiến dịch gây quỹ thành công");
    }
}
