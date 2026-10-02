package com.heritage.platform.modules.artisan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequest {

    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "50000.00", message = "Số tiền rút tối thiểu là 50.000 VNĐ")
    private BigDecimal amount;

    @NotBlank(message = "Vui lòng chọn ngân hàng thụ hưởng")
    private String bankName;

    @NotBlank(message = "Vui lòng nhập số tài khoản ngân hàng")
    private String bankAccountNumber;

    @NotBlank(message = "Vui lòng nhập tên chủ tài khoản thụ hưởng")
    private String bankAccountName;

    private String note;
}
