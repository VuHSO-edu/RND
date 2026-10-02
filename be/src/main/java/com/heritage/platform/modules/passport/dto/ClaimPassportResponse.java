package com.heritage.platform.modules.passport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimPassportResponse {
    private String message;
    private String ownerName;
    private Instant claimedAt;
    private String certificateDownloadUrl;
}
