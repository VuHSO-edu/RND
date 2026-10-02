package com.heritage.platform.modules.article.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.article.dto.ArticleDetailResponse;
import com.heritage.platform.modules.article.dto.ArticleSummaryResponse;
import com.heritage.platform.modules.article.service.HeritageArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class PublicArticleController {

    private final HeritageArticleService articleService;

    /**
     * 2.2. [R] Danh sách bài viết tạp chí phân trang
     */
    @GetMapping
    public ApiResponse<PagedResponse<ArticleSummaryResponse>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long villageId,
            @RequestParam(required = false) Long artisanId
    ) {
        Page<ArticleSummaryResponse> result = articleService.getArticles(page, size, villageId, artisanId);
        return ApiResponse.ok(PagedResponse.of(result), "Lấy danh sách bài viết thành công");
    }

    /**
     * 2.2. [R] Chi tiết bài viết theo slug
     */
    @GetMapping("/{slug}")
    public ApiResponse<ArticleDetailResponse> getArticleDetail(@PathVariable String slug) {
        ArticleDetailResponse article = articleService.getArticleBySlug(slug);
        return ApiResponse.ok(article, "Lấy nội dung bài viết thành công");
    }
}
