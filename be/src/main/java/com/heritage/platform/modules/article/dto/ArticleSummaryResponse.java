package com.heritage.platform.modules.article.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSummaryResponse {
    private UUID id;
    private String title;
    private String slug;
    private String excerpt;
    private String coverImageUrl;
    private Integer viewsCount;
    private Instant publishedAt;
    private String villageName;
    private String artisanName;
}
