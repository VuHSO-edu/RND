package com.heritage.platform.modules.map.repository;

import com.heritage.platform.modules.map.entity.MapLocation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MapLocationRepository extends JpaRepository<MapLocation, Long> {

    @EntityGraph(attributePaths = {"craftVillage", "submittedBy"})
    List<MapLocation> findByApprovalStatusAndIsDeletedFalse(String approvalStatus);

    @EntityGraph(attributePaths = {"craftVillage", "submittedBy"})
    List<MapLocation> findByCraftVillageIdAndApprovalStatusAndIsDeletedFalse(Long craftVillageId, String approvalStatus);

    @EntityGraph(attributePaths = {"craftVillage", "submittedBy"})
    List<MapLocation> findByReviewScopeAndApprovalStatusAndIsDeletedFalse(String reviewScope, String approvalStatus);

    @EntityGraph(attributePaths = {"craftVillage", "submittedBy"})
    List<MapLocation> findBySubmittedByIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    @Query(value = "SELECT * FROM map_locations WHERE is_deleted = false AND approval_status = 'APPROVED' AND (coordinates && ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))", nativeQuery = true)
    List<MapLocation> findWithinBoundingBox(
            @Param("minLng") double minLng,
            @Param("minLat") double minLat,
            @Param("maxLng") double maxLng,
            @Param("maxLat") double maxLat
    );

    @Query(value = "SELECT id FROM craft_villages WHERE is_deleted = false AND is_active = true AND ST_DWithin(coordinates::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, coverage_radius_meters) LIMIT 1", nativeQuery = true)
    Long findNearbyVillageId(@Param("lat") double lat, @Param("lng") double lng);
}
