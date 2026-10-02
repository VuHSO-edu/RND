package com.heritage.platform.modules.passport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimPassportRequest {
    private String activationSecretCode;
    private String notes;
}
