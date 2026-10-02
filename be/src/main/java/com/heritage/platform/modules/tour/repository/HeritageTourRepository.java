package com.heritage.platform.modules.tour.repository;

import com.heritage.platform.modules.tour.entity.HeritageTour;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HeritageTourRepository extends JpaRepository<HeritageTour, UUID> {

    @EntityGraph(attributePaths = {"craftVillage", "artisan"})
    Optional<HeritageTour> findByIdAndIsDeletedFalse(UUID id);

    @EntityGraph(attributePaths = {"craftVillage", "artisan"})
    List<HeritageTour> findByStatusAndIsDeletedFalse(String status);

    @EntityGraph(attributePaths = {"craftVillage", "artisan"})
    List<HeritageTour> findByCraftVillageIdAndStatusAndIsDeletedFalse(Long craftVillageId, String status);

    @Query("SELECT t FROM HeritageTour t WHERE t.isDeleted = false AND t.status = 'ACTIVE' " +
           "AND (:villageId IS NULL OR t.craftVillage.id = :villageId) " +
           "AND (:minPrice IS NULL OR t.pricePerPerson >= :minPrice) " +
           "AND (:maxPrice IS NULL OR t.pricePerPerson <= :maxPrice)")
    List<HeritageTour> searchTours(
            @Param("villageId") Long villageId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
