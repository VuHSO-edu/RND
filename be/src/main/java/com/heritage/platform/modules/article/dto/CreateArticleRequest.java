package com.heritage.platform.modules.article.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateArticleRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    private String title;

    private String slug;

    private Long craftVillageId;

    private Long artisanId;

    private String excerpt;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    private String coverImageUrl;

    private String audioInterviewUrl;

    private String videoInterviewUrl;

    @Builder.Default
    private String status = "PUBLISHED";
}
