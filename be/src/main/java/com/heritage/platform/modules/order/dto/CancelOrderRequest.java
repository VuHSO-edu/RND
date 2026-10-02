package com.heritage.platform.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelOrderRequest {
    @NotBlank(message = "Vui lòng nhập lý do hủy đơn hàng")
    private String reason;
}
