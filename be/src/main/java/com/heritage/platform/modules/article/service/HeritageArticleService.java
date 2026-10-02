package com.heritage.platform.modules.article.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.article.dto.ArticleActionResponses;
import com.heritage.platform.modules.article.dto.ArticleDetailResponse;
import com.heritage.platform.modules.article.dto.ArticleSummaryResponse;
import com.heritage.platform.modules.article.dto.CreateArticleRequest;
import com.heritage.platform.modules.article.entity.HeritageArticle;
import com.heritage.platform.modules.article.repository.HeritageArticleRepository;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeritageArticleService {

    private final HeritageArticleRepository articleRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public ArticleActionResponses.CreateResponse createArticle(Long authorUserId, CreateArticleRequest req) {
        User author = authorUserId != null ? userRepository.findById(authorUserId).orElse(null) : null;
        CraftVillage village = req.getCraftVillageId() != null 
                ? craftVillageRepository.findById(req.getCraftVillageId()).orElse(null) 
                : null;
        ArtisanProfile artisan = req.getArtisanId() != null 
                ? artisanProfileRepository.findById(req.getArtisanId()).orElse(null) 
                : null;

        String slug = req.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = toSlug(req.getTitle()) + "-" + UUID.randomUUID().toString().substring(0, 6);
        } else {
            slug = toSlug(slug);
        }

        HeritageArticle article = HeritageArticle.builder()
                .title(req.getTitle().trim())
                .slug(slug)
                .excerpt(req.getExcerpt())
                .content(req.getContent())
                .coverImageUrl(req.getCoverImageUrl())
                .audioInterviewUrl(req.getAudioInterviewUrl())
                .videoInterviewUrl(req.getVideoInterviewUrl())
                .craftVillage(village)
                .artisan(artisan)
                .author(author)
                .viewsCount(0)
                .status(req.getStatus() != null ? req.getStatus() : "PUBLISHED")
                .publishedAt(Instant.now())
                .build();

        HeritageArticle saved = articleRepository.save(article);
        log.info("[ARTICLE] Đăng bài viết di sản mới: {} (slug={})", saved.getTitle(), saved.getSlug());

        return ArticleActionResponses.CreateResponse.builder()
                .id(saved.getId())
                .slug(saved.getSlug())
                .publishedAt(saved.getPublishedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ArticleSummaryResponse> getArticles(int page, int size, Long villageId, Long artisanId) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<HeritageArticle> articles;

        if (villageId != null) {
            articles = articleRepository.findByCraftVillageIdAndStatusAndIsDeletedFalse(villageId, "PUBLISHED", pageable);
        } else if (artisanId != null) {
            articles = articleRepository.findByArtisanIdAndStatusAndIsDeletedFalse(artisanId, "PUBLISHED", pageable);
        } else {
            articles = articleRepository.findByStatusAndIsDeletedFalse("PUBLISHED", pageable);
        }

        return articles.map(a -> ArticleSummaryResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .slug(a.getSlug())
                .excerpt(a.getExcerpt())
                .coverImageUrl(a.getCoverImageUrl())
                .viewsCount(a.getViewsCount())
                .publishedAt(a.getPublishedAt())
                .villageName(a.getCraftVillage() != null ? a.getCraftVillage().getName() : null)
                .artisanName(a.getArtisan() != null && a.getArtisan().getUser() != null ? a.getArtisan().getUser().getFullName() : null)
                .build());
    }

    @Transactional
    public ArticleDetailResponse getArticleBySlug(String slug) {
        HeritageArticle article = articleRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy bài viết với đường dẫn: " + slug));

        // Tăng lượt xem
        articleRepository.incrementViewsCount(article.getId());

        Map<String, String> media = new LinkedHashMap<>();
        if (article.getAudioInterviewUrl() != null) media.put("audio", article.getAudioInterviewUrl());
        if (article.getVideoInterviewUrl() != null) media.put("video", article.getVideoInterviewUrl());

        return ArticleDetailResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .excerpt(article.getExcerpt())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .media(media)
                .author(article.getAuthor() != null ? ArticleDetailResponse.AuthorInfo.builder()
                        .name(article.getAuthor().getFullName())
                        .role(article.getAuthor().getRole())
                        .build() : null)
                .relatedVillage(article.getCraftVillage() != null ? ArticleDetailResponse.RelatedEntity.builder()
                        .id(article.getCraftVillage().getId().toString())
                        .name(article.getCraftVillage().getName())
                        .build() : null)
                .relatedArtisan(article.getArtisan() != null ? ArticleDetailResponse.RelatedEntity.builder()
                        .id(article.getArtisan().getId().toString())
                        .name(article.getArtisan().getUser() != null ? article.getArtisan().getUser().getFullName() : article.getArtisan().getTitle())
                        .build() : null)
                .viewsCount(article.getViewsCount() + 1)
                .publishedAt(article.getPublishedAt())
                .build();
    }

    @Transactional
    public ArticleActionResponses.UpdateResponse updateArticle(UUID id, Long adminUserId, CreateArticleRequest req) {
        HeritageArticle article = articleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy bài viết với ID: " + id));

        if (req.getTitle() != null && !req.getTitle().isBlank()) article.setTitle(req.getTitle().trim());
        if (req.getContent() != null && !req.getContent().isBlank()) article.setContent(req.getContent());
        if (req.getExcerpt() != null) article.setExcerpt(req.getExcerpt());
        if (req.getCoverImageUrl() != null) article.setCoverImageUrl(req.getCoverImageUrl());
        if (req.getAudioInterviewUrl() != null) article.setAudioInterviewUrl(req.getAudioInterviewUrl());
        if (req.getVideoInterviewUrl() != null) article.setVideoInterviewUrl(req.getVideoInterviewUrl());
        if (req.getStatus() != null) article.setStatus(req.getStatus());

        if (req.getCraftVillageId() != null) {
            CraftVillage v = craftVillageRepository.findById(req.getCraftVillageId()).orElse(null);
            article.setCraftVillage(v);
        }
        if (req.getArtisanId() != null) {
            ArtisanProfile a = artisanProfileRepository.findById(req.getArtisanId()).orElse(null);
            article.setArtisan(a);
        }

        HeritageArticle saved = articleRepository.save(article);
        log.info("[ARTICLE] Cập nhật bài viết di sản: id={}", saved.getId());

        return ArticleActionResponses.UpdateResponse.builder()
                .id(saved.getId())
                .updatedAt(Instant.now())
                .status(saved.getStatus())
                .build();
    }

    @Transactional
    public void deleteArticle(UUID id) {
        HeritageArticle article = articleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy bài viết với ID: " + id));

        article.setDeleted(true);
        article.setStatus("ARCHIVED");
        articleRepository.save(article);
        log.info("[ARTICLE] Xóa mềm bài viết di sản: id={}", id);
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[đĐ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug;
    }
}
