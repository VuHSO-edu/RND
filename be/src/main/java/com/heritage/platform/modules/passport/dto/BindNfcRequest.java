package com.heritage.platform.modules.passport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BindNfcRequest {

    @NotBlank(message = "common:validation.required")
    private String nfcTagUid;
}
