package com.heritage.platform.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotEmpty(message = "Giỏ hàng không được để trống")
    private List<CartItemRequest> items;

    @NotBlank(message = "Vui lòng nhập họ tên người nhận")
    private String recipientName;

    @NotBlank(message = "Vui lòng nhập số điện thoại nhận hàng")
    private String recipientPhone;

    @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
    private String shippingAddress;

    private String customerNote;

    @Builder.Default
    private String paymentMethod = "VIETQR"; // VIETQR, COD

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        @Positive(message = "Mã sản phẩm không hợp lệ")
        private Long productId;

        @Positive(message = "Số lượng sản phẩm phải lớn hơn 0")
        private Integer quantity;
    }
}
