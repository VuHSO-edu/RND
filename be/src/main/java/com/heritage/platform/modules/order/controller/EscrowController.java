package com.heritage.platform.modules.order.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.order.dto.DisputeEscrowRequest;
import com.heritage.platform.modules.order.entity.EscrowTransaction;
import com.heritage.platform.modules.order.service.EscrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/escrow")
@RequiredArgsConstructor
public class EscrowController {

    private final EscrowService escrowService;

    /**
     * R (Read) - Tra cứu thông tin ký quỹ của đơn hàng
     */
    @GetMapping("/order/{orderId}")
    public ApiResponse<EscrowTransaction> getEscrowByOrderId(@PathVariable Long orderId) {
        EscrowTransaction escrow = escrowService.getEscrowByOrderId(orderId);
        return ApiResponse.ok(escrow, "Lấy thông tin ký quỹ thành công");
    }

    /**
     * U (Update) - Giải ngân sớm tiền ký quỹ về ví khả dụng của nghệ nhân
     */
    @PostMapping("/{orderId}/release")
    public ApiResponse<Void> releaseEscrow(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        escrowService.releaseEscrowToArtisan(orderId);
        return ApiResponse.ok(null, "Giải ngân ký quỹ thành công! Số tiền đã được chuyển vào số dư khả dụng của nghệ nhân.");
    }

    /**
     * U (Update) - Khách hàng mở khiếu nại chất lượng tác phẩm trong thời hạn ký quỹ 7 ngày
     */
    @PostMapping("/{orderId}/dispute")
    public ApiResponse<Void> disputeEscrow(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-User-Id", required = false) Long customerId,
            @Valid @RequestBody DisputeEscrowRequest request
    ) {
        escrowService.disputeEscrow(orderId, request.getDisputeReason(), request.getEvidenceImageUrl());
        return ApiResponse.ok(null, "Mở khiếu nại ký quỹ thành công! Bộ đếm thời gian tự động giải ngân đã được tạm dừng để Ban Quản Lý thẩm định.");
    }
}
