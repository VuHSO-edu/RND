package com.heritage.platform.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeEscrowRequest {
    @NotBlank(message = "Vui lòng nêu rõ lý do mở khiếu nại/tranh chấp")
    private String disputeReason;

    private String evidenceImageUrl;
}
