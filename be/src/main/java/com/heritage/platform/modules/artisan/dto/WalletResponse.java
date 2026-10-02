package com.heritage.platform.modules.artisan.dto;

import com.heritage.platform.modules.artisan.entity.WalletTransaction;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Long artisanId;
    private String artisanName;
    private BigDecimal availableBalance;
    private BigDecimal escrowBalance;
    private BigDecimal totalWithdrawn;
    private List<WalletTransaction> transactions;
}
