package com.heritage.platform.modules.passport.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchReviewRequest {

    private Boolean approved;

    private String action; // APPROVE hoặc REJECT

    private String rejectionReason;
}
