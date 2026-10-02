package com.heritage.platform.modules.order.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private String skuCode;
    private String passportCode;
    private Long artisanId;
    private String artisanName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
