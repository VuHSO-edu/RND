package com.heritage.platform.modules.article.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.article.dto.ArticleActionResponses;
import com.heritage.platform.modules.article.dto.CreateArticleRequest;
import com.heritage.platform.modules.article.service.HeritageArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/villages/articles")
@RequiredArgsConstructor
public class VillageArticleController {

    private final HeritageArticleService articleService;

    /**
     * 2.1. [C] Đăng tải bài viết di sản mới
     */
    @PostMapping
    public ResponseEntity<ArticleActionResponses.CreateResponse> createArticle(
            @RequestHeader(value = "X-User-Id", required = false) Long authorUserId,
            @Valid @RequestBody CreateArticleRequest request
    ) {
        ArticleActionResponses.CreateResponse response = articleService.createArticle(authorUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 2.3. [U] Cập nhật bài viết
     */
    @PutMapping("/{id}")
    public ApiResponse<ArticleActionResponses.UpdateResponse> updateArticle(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) Long adminUserId,
            @Valid @RequestBody CreateArticleRequest request
    ) {
        ArticleActionResponses.UpdateResponse response = articleService.updateArticle(id, adminUserId, request);
        return ApiResponse.ok(response, "Cập nhật bài viết thành công");
    }

    /**
     * 2.4. [D] Xóa mềm bài viết
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> deleteArticle(@PathVariable UUID id) {
        articleService.deleteArticle(id);
        return ApiResponse.ok(Map.of("success", true), "Bài viết đã được gỡ bỏ khỏi tạp chí.");
    }
}
