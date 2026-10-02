package com.heritage.platform.modules.order.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.order.dto.CancelOrderRequest;
import com.heritage.platform.modules.order.dto.CreateOrderRequest;
import com.heritage.platform.modules.order.dto.OrderResponse;
import com.heritage.platform.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * C (Create) - Khách hàng tạo đơn đặt hàng mới & khởi tạo Ký quỹ Escrow
     */
    @PostMapping
    public ApiResponse<OrderResponse> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) Long customerId,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderResponse response = orderService.createOrder(customerId, request);
        return ApiResponse.ok(response, "Đặt hàng thành công! Đơn hàng được bảo hộ bởi hệ thống ký quỹ Escrow 7 ngày.");
    }

    /**
     * R (Read) - Xem danh sách đơn hàng đã mua của khách hàng
     */
    @GetMapping("/my-orders")
    public ApiResponse<List<OrderResponse>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) Long customerId
    ) {
        List<OrderResponse> list = orderService.getMyOrders(customerId);
        return ApiResponse.ok(list, "Lấy danh sách đơn hàng thành công");
    }

    /**
     * R (Read) - Xem chi tiết một đơn hàng kèm mã VietQR và trạng thái ký quỹ
     */
    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        OrderResponse response = orderService.getOrderById(orderId, userId);
        return ApiResponse.ok(response, "Lấy chi tiết đơn hàng thành công");
    }

    /**
     * U (Update) - Hủy đơn hàng trước khi nghệ nhân xuất kho
     */
    @PutMapping("/{orderId}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader(value = "X-User-Id", required = false) Long customerId,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        OrderResponse response = orderService.cancelOrder(orderId, customerId, request.getReason());
        return ApiResponse.ok(response, "Hủy đơn hàng thành công! Tiền ký quỹ và số lượng kho đã được hoàn lại.");
    }
}
