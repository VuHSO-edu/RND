package com.heritage.platform.modules.artisan.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.artisan.dto.ArtisanOrderDto;
import com.heritage.platform.modules.artisan.dto.UpdateOrderStatusRequest;
import com.heritage.platform.modules.artisan.service.ArtisanOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/artisan/orders")
@RequiredArgsConstructor
public class ArtisanOrderController {

    private final ArtisanOrderService artisanOrderService;

    /**
     * R (Read) - Danh sách các đơn đặt hàng tác phẩm của nghệ nhân (Kanban)
     */
    @GetMapping
    public ApiResponse<List<ArtisanOrderDto>> getArtisanOrders(
            @RequestHeader(value = "X-Artisan-Id", required = false) Long artisanId
    ) {
        List<ArtisanOrderDto> orders = artisanOrderService.getArtisanOrders(artisanId);
        return ApiResponse.ok(orders, "Lấy danh sách đơn hàng của nghệ nhân thành công");
    }

    /**
     * U (Update) - Cập nhật tiến độ hoàn thành & quy trình đóng gói đơn hàng
     */
    @PutMapping("/{orderId}/status")
    public ApiResponse<ArtisanOrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-Artisan-Id", required = false) Long artisanId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        ArtisanOrderDto updated = artisanOrderService.updateOrderStatus(artisanId, orderId, request);
        return ApiResponse.ok(updated, "Cập nhật tiến độ đơn hàng thành công");
    }

    /**
     * C (Create) - Sinh mã vận đơn & phiếu in tem gửi hàng bưu điện
     */
    @PostMapping("/{orderId}/shipping-label")
    public ApiResponse<Map<String, Object>> generateShippingLabel(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-Artisan-Id", required = false) Long artisanId
    ) {
        Map<String, Object> labelData = artisanOrderService.generateShippingLabel(artisanId, orderId);
        return ApiResponse.ok(labelData, "Sinh phiếu in tem giao hàng thành công");
    }
}
