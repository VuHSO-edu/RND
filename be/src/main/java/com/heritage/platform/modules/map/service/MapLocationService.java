package com.heritage.platform.modules.map.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.map.dto.ProposeLocationRequest;
import com.heritage.platform.modules.map.entity.MapLocation;
import com.heritage.platform.modules.map.repository.MapLocationRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapLocationService {

    private final MapLocationRepository mapLocationRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MapLocation> getLocations(Double minLng, Double minLat, Double maxLng, Double maxLat) {
        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            log.info("[MAP] Truy vấn điểm theo Bounding Box PostGIS: [{}, {}] -> [{}, {}]", minLng, minLat, maxLng, maxLat);
            return mapLocationRepository.findWithinBoundingBox(minLng, minLat, maxLng, maxLat);
        }
        return mapLocationRepository.findByApprovalStatusAndIsDeletedFalse("APPROVED");
    }

    @Transactional(readOnly = true)
    public List<MapLocation> getPendingForVillage(Long villageId) {
        return mapLocationRepository.findByCraftVillageIdAndApprovalStatusAndIsDeletedFalse(villageId, "PENDING");
    }

    @Transactional(readOnly = true)
    public List<MapLocation> getPendingForSuperAdmin() {
        return mapLocationRepository.findByReviewScopeAndApprovalStatusAndIsDeletedFalse("SUPER_ADMIN", "PENDING");
    }

    @Transactional
    public MapLocation proposeLocation(Long userId, ProposeLocationRequest request) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Tự động phân luồng theo hàm ST_DWithin PostGIS
        Long nearbyVillageId = mapLocationRepository.findNearbyVillageId(request.getLatitude(), request.getLongitude());

        CraftVillage village = null;
        String reviewScope = "SUPER_ADMIN";

        if (nearbyVillageId != null) {
            village = craftVillageRepository.findById(nearbyVillageId).orElse(null);
            if (village != null) {
                reviewScope = "VILLAGE";
                log.info("[MAP] Điểm nằm trong bán kính {}m của làng {}. Phân luồng VILLAGE review.", 
                        village.getCoverageRadiusMeters(), village.getName());
            }
        } else if (request.getCraftVillageId() != null) {
            village = craftVillageRepository.findById(request.getCraftVillageId()).orElse(null);
            if (village != null) {
                reviewScope = "VILLAGE";
            }
        }

        MapLocation location = MapLocation.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .category(request.getCategory().trim().toUpperCase())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .images(request.getImages())
                .craftVillage(village)
                .submittedBy(user)
                .reviewScope(reviewScope)
                .approvalStatus("PENDING")
                .build();

        location.syncCoordinates();
        MapLocation saved = mapLocationRepository.save(location);
        log.info("[MAP] Đề xuất điểm di sản mới: id={}, title={}, scope={}", saved.getId(), saved.getTitle(), saved.getReviewScope());
        return saved;
    }

    @Transactional
    public MapLocation reviewLocation(Long locationId, Long reviewerUserId, boolean approved, String rejectionReason) {
        MapLocation location = mapLocationRepository.findById(locationId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy điểm di sản với ID: " + locationId));

        User reviewer = reviewerUserId != null ? userRepository.findById(reviewerUserId).orElse(null) : null;

        if (approved) {
            location.setApprovalStatus("APPROVED");
            location.setReviewedBy(reviewer);
            location.setRejectionReason(null);
            log.info("[MAP] Phê duyệt điểm di sản: {} (id={})", location.getTitle(), location.getId());
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new BusinessException("VALIDATION_ERROR", "Lý do từ chối không được để trống khi từ chối điểm di sản");
            }
            location.setApprovalStatus("REJECTED");
            location.setReviewedBy(reviewer);
            location.setRejectionReason(rejectionReason.trim());
            log.info("[MAP] Từ chối điểm di sản: {} (id={}), Lý do: {}", location.getTitle(), location.getId(), rejectionReason);
        }

        return mapLocationRepository.save(location);
    }
}
