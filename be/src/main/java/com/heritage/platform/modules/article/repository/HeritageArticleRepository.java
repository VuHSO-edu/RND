package com.heritage.platform.modules.article.repository;

import com.heritage.platform.modules.article.entity.HeritageArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HeritageArticleRepository extends JpaRepository<HeritageArticle, UUID> {

    @EntityGraph(attributePaths = {"craftVillage", "artisan", "author"})
    Optional<HeritageArticle> findBySlugAndIsDeletedFalse(String slug);

    @EntityGraph(attributePaths = {"craftVillage", "artisan", "author"})
    Optional<HeritageArticle> findByIdAndIsDeletedFalse(UUID id);

    @EntityGraph(attributePaths = {"craftVillage", "artisan", "author"})
    Page<HeritageArticle> findByStatusAndIsDeletedFalse(String status, Pageable pageable);

    @EntityGraph(attributePaths = {"craftVillage", "artisan", "author"})
    Page<HeritageArticle> findByCraftVillageIdAndStatusAndIsDeletedFalse(Long villageId, String status, Pageable pageable);

    @EntityGraph(attributePaths = {"craftVillage", "artisan", "author"})
    Page<HeritageArticle> findByArtisanIdAndStatusAndIsDeletedFalse(Long artisanId, String status, Pageable pageable);

    @Modifying
    @Query("UPDATE HeritageArticle a SET a.viewsCount = a.viewsCount + 1 WHERE a.id = :id")
    void incrementViewsCount(@Param("id") UUID id);
}
