package com.heritage.platform.modules.order.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String shippingStatus;
    private String shippingAddress;
    private String vietQrPayload;
    private String vietQrImageUrl;
    private String bankAccountNumber;
    private String bankName;
    private String transferContent;

    // Escrow details
    private String escrowStatus;
    private BigDecimal escrowHoldAmount;
    private BigDecimal escrowNetPayout;
    private Instant escrowAutoReleaseDate;
    private Boolean isDisputed;

    private List<OrderItemDto> items;
    private Instant createdAt;
}
