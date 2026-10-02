package com.heritage.platform.modules.artisan.dto;

import com.heritage.platform.modules.order.dto.OrderItemDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtisanOrderDto {
    private Long orderId;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private BigDecimal totalAmount;
    private BigDecimal artisanPayout;
    private String shippingStatus; // PREPARING, CRAFTING, SHIPPED, DELIVERED
    private String paymentStatus;
    private String escrowStatus;
    private String trackingNumber;
    private List<OrderItemDto> items;
    private Instant createdAt;
}
