package com.heritage.platform.modules.product.repository;

import com.heritage.platform.modules.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"artisan", "artisan.user", "artisan.craftVillage"})
    Page<Product> findByStatusAndIsDeletedFalse(String status, Pageable pageable);

    @EntityGraph(attributePaths = {"artisan", "artisan.user", "artisan.craftVillage"})
    Page<Product> findByCategoryIdAndStatusAndIsDeletedFalse(Integer categoryId, String status, Pageable pageable);

    @EntityGraph(attributePaths = {"artisan", "artisan.user", "artisan.craftVillage"})
    Optional<Product> findBySlugAndIsDeletedFalse(String slug);

    @EntityGraph(attributePaths = {"artisan", "artisan.user", "artisan.craftVillage"})
    Optional<Product> findByIdAndIsDeletedFalse(Long id);

    boolean existsBySlug(String slug);
}
