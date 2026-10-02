package com.heritage.platform.modules.artisan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Trạng thái đơn hàng không được để trống")
    private String status; // PREPARING, CRAFTING, SHIPPED, DELIVERED

    private String trackingNumber;
    private String note;
}
