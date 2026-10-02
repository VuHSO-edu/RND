package com.heritage.platform.modules.artisan.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.artisan.dto.WalletResponse;
import com.heritage.platform.modules.artisan.dto.WithdrawRequest;
import com.heritage.platform.modules.artisan.entity.WalletTransaction;
import com.heritage.platform.modules.artisan.service.ArtisanPayoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/artisan/wallet")
@RequiredArgsConstructor
public class ArtisanWalletController {

    private final ArtisanPayoutService payoutService;

    /**
     * R (Read) - Xem thông tin ví nghệ nhân, số dư khả dụng, số dư ký quỹ & lịch sử rút tiền
     */
    @GetMapping
    public ApiResponse<WalletResponse> getWallet(
            @RequestHeader(value = "X-Artisan-Id", required = false) Long artisanId
    ) {
        WalletResponse response = payoutService.getWalletInfo(artisanId);
        return ApiResponse.ok(response, "Lấy thông tin ví nghệ nhân thành công");
    }

    /**
     * C (Create) - Nghệ nhân yêu cầu rút tiền về ngân hàng
     */
    @PostMapping("/withdraw")
    public ApiResponse<WalletTransaction> withdraw(
            @RequestHeader(value = "X-Artisan-Id", required = false) Long artisanId,
            @Valid @RequestBody WithdrawRequest request
    ) {
        WalletTransaction tx = payoutService.requestWithdraw(artisanId, request);
        return ApiResponse.ok(tx, "Yêu cầu rút tiền thành công! Tiền sẽ được chuyển về tài khoản ngân hàng trong 1-2 giờ làm việc.");
    }
}
