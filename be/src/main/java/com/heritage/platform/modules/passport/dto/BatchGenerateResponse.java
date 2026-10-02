package com.heritage.platform.modules.passport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchGenerateResponse {
    private Long batchId;
    private String batchCode;
    private Integer totalGenerated;
    private String downloadZipUrl;
}
