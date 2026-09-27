package com.heritage.platform.modules.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String fileUrl;
    private String objectKey;
    private String originalFileName;
    private String contentType;
    private long sizeBytes;
    private String formattedSize;
}
