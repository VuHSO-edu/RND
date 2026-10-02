package com.heritage.platform.modules.map.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.map.dto.GeoJsonFeatureCollection;
import com.heritage.platform.modules.map.dto.ProposeLocationRequest;
import com.heritage.platform.modules.map.dto.ProposeLocationResponse;
import com.heritage.platform.modules.map.dto.ReviewMapLocationActionRequest;
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

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

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
            return mapLocationRepository.findWithinBoundingBox(minLng, minLat, maxLng, maxLat);
        }
        return mapLocationRepository.findByApprovalStatusAndIsDeletedFalse("APPROVED");
    }

    @Transactional(readOnly = true)
    public GeoJsonFeatureCollection getGeoJsonLocations(Double minLng, Double minLat, Double maxLng, Double maxLat, String category, String craftType) {
        List<MapLocation> list;
        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            list = mapLocationRepository.findWithinBoundingBox(minLng, minLat, maxLng, maxLat);
        } else {
            list = mapLocationRepository.findByApprovalStatusAndIsDeletedFalse("APPROVED");
        }

        // Áp dụng bộ lọc category và craftType
        if (category != null && !category.isBlank()) {
            String catUpper = category.trim().toUpperCase();
            list = list.stream().filter(l -> catUpper.equalsIgnoreCase(l.getCategory())).collect(Collectors.toList());
        }
        if (craftType != null && !craftType.isBlank()) {
            String ct = craftType.trim();
            list = list.stream().filter(l -> l.getCraftVillage() != null && ct.equalsIgnoreCase(l.getCraftVillage().getCraftType())).collect(Collectors.toList());
        }

        List<GeoJsonFeatureCollection.GeoJsonFeature> features = list.stream().map(loc -> {
            Map<String, Object> props = new LinkedHashMap<>();
            props.put("id", loc.getId().toString());
            props.put("title", loc.getTitle());
            props.put("category", loc.getCategory());
            props.put("description", loc.getDescription());
            props.put("craftType", loc.getCraftVillage() != null ? loc.getCraftVillage().getCraftType() : "Khác");
            props.put("activeArtisansCount", loc.getCraftVillage() != null ? 42 : 1);
            props.put("historySnippet", loc.getDescription() != null ? loc.getDescription() : "Điểm di sản làng nghề văn hóa.");
            
            // Xử lý thumbnail
            String thumb = (loc.getImages() != null && !loc.getImages().isBlank()) 
                    ? loc.getImages().split(",")[0].replace("[", "").replace("]", "").replace("\"", "").trim()
                    : "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80";
            props.put("thumbnail", thumb);

            if (loc.getCraftVillage() != null) {
                props.put("villageId", loc.getCraftVillage().getId().toString());
                props.put("villageName", loc.getCraftVillage().getName());
            }

            return GeoJsonFeatureCollection.GeoJsonFeature.builder()
                    .type("Feature")
                    .geometry(GeoJsonFeatureCollection.GeoJsonGeometry.builder()
                            .type("Point")
                            .coordinates(new double[]{loc.getLongitude(), loc.getLatitude()})
                            .build())
                    .properties(props)
                    .build();
        }).collect(Collectors.toList());

        return GeoJsonFeatureCollection.builder()
                .type("FeatureCollection")
                .features(features)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MapLocation> getMyProposals(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return mapLocationRepository.findBySubmittedByIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public ProposeLocationResponse proposeLocation(Long userId, ProposeLocationRequest request) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Tự động phân luồng theo hàm ST_DWithin PostGIS
        Long nearbyVillageId = mapLocationRepository.findNearbyVillageId(request.getLatitude(), request.getLongitude());

        CraftVillage village = null;
        String reviewScope = "SUPER_ADMIN";
        String message = "Đề xuất đã được gửi tới Quản trị viên hệ thống để thẩm định.";

        if (nearbyVillageId != null) {
            village = craftVillageRepository.findById(nearbyVillageId).orElse(null);
            if (village != null) {
                reviewScope = "VILLAGE";
                message = "Đề xuất đã được gửi tới Ban quản lý làng nghề để thẩm định.";
                log.info("[MAP] Điểm nằm trong bán kính {}m của làng {}. Phân luồng VILLAGE review.", 
                        village.getCoverageRadiusMeters(), village.getName());
            }
        } else if (request.getCraftVillageId() != null) {
            village = craftVillageRepository.findById(request.getCraftVillageId()).orElse(null);
            if (village != null) {
                reviewScope = "VILLAGE";
                message = "Đề xuất đã được gửi tới Ban quản lý làng nghề để thẩm định.";
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

        return ProposeLocationResponse.builder()
                .id(saved.getId().toString())
                .status("PENDING")
                .reviewScope(reviewScope)
                .assignedVillageId(village != null ? village.getId().toString() : null)
                .message(message)
                .build();
    }

    @Transactional
    public ReviewMapLocationActionRequest.Response reviewLocationAction(Long locationId, Long reviewerUserId, String action, String rejectionReason) {
        MapLocation location = mapLocationRepository.findById(locationId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy điểm di sản với ID: " + locationId));

        User reviewer = reviewerUserId != null ? userRepository.findById(reviewerUserId).orElse(null) : null;
        boolean isApproved = "APPROVE".equalsIgnoreCase(action);

        if (isApproved) {
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

        mapLocationRepository.save(location);

        return ReviewMapLocationActionRequest.Response.builder()
                .id(location.getId().toString())
                .approvalStatus(location.getApprovalStatus())
                .rejectionReason(location.getRejectionReason())
                .reviewedAt(Instant.now())
                .build();
    }

    @Transactional
    public void deleteLocation(Long locationId) {
        MapLocation location = mapLocationRepository.findById(locationId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy điểm di sản với ID: " + locationId));

        location.setDeleted(true);
        location.setApprovalStatus("REJECTED");
        mapLocationRepository.save(location);
        log.info("[MAP] Xóa mềm điểm di sản: id={}", locationId);
    }
}
