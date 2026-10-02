package com.heritage.platform.modules.crowdfunding.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.crowdfunding.dto.CampaignResponses;
import com.heritage.platform.modules.crowdfunding.dto.DonationDTOs;
import com.heritage.platform.modules.crowdfunding.service.CrowdfundingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crowdfunding")
@RequiredArgsConstructor
public class PublicCrowdfundingController {

    private final CrowdfundingService crowdfundingService;

    /**
     * 4.2. [R] Tra cứu danh sách các chiến dịch gây quỹ bảo tồn đang mở
     */
    @GetMapping
    public ApiResponse<List<CampaignResponses.CampaignSummaryResponse>> getCampaigns() {
        List<CampaignResponses.CampaignSummaryResponse> list = crowdfundingService.getCampaigns();
        return ApiResponse.ok(list, "Lấy danh sách chiến dịch gây quỹ thành công");
    }

    /**
     * 4.2. [R] Chi tiết chiến dịch & Tiến độ giải ngân & Danh sách ủng hộ gần nhất
     */
    @GetMapping("/{id}")
    public ApiResponse<CampaignResponses.CampaignDetailResponse> getCampaignById(@PathVariable UUID id) {
        CampaignResponses.CampaignDetailResponse detail = crowdfundingService.getCampaignById(id);
        return ApiResponse.ok(detail, "Lấy chi tiết chiến dịch thành công");
    }

    /**
     * 4.3. [C/Action] Quyên góp ủng hộ dự án bảo tồn di sản (VietQR)
     */
    @PostMapping("/{id}/donate")
    public ApiResponse<DonationDTOs.DonationResponse> donate(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) Long donorUserId,
            @Valid @RequestBody DonationDTOs.DonateRequest request
    ) {
        DonationDTOs.DonationResponse response = crowdfundingService.donate(id, donorUserId, request);
        return ApiResponse.ok(response, "Ủng hộ dự án thành công. Vui lòng hoàn tất thanh toán!");
    }
}
