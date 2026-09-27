package com.heritage.platform.modules.ai3d.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ai3dGenerateRequest {
    private String imageUrl;
    private String artworkName;
    private String materialType; // Gốm sứ men rạn, Gỗ trầm, Lụa...
    private boolean enablePbr;    // Bật hiệu ứng phản quang men bóng
}
