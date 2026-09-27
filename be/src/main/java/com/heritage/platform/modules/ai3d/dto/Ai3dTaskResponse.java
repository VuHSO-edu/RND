package com.heritage.platform.modules.ai3d.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ai3dTaskResponse {
    private String taskId;
    private String status; // QUEUED, PROCESSING, SUCCESS, FAILED
    private int progressPercent; // 0 - 100%
    private String message;
    private String model3dUrl; // Link tải file .glb
    private String renderedThumbnailUrl;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
