package com.heritage.platform.modules.passport.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchGenerateRequest {

    @NotNull(message = "common:validation.required")
    private Long productId;

    @NotNull(message = "common:validation.required")
    @Min(value = 1, message = "Số lượng trong lô tối thiểu là 1")
    @Max(value = 1000, message = "Số lượng trong lô tối đa là 1000 cho mỗi đợt")
    private Integer quantity;

    private String batchNotes;

    private String craftingVideoUrl;

    private String artisanStoryQuote;

    private Instant productionDate;
}
