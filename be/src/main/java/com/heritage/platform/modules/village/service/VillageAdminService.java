package com.heritage.platform.modules.village.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.dto.ProxyArtisanCreateRequest;
import com.heritage.platform.modules.village.dto.ProxyArtisanResponse;
import com.heritage.platform.modules.village.dto.ReviewArtisanRequest;
import com.heritage.platform.modules.village.dto.UpdateVillageProfileRequest;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VillageAdminService {

    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public CraftVillage getVillageForAdmin(Long adminUserId, Long villageIdFallback) {
        if (adminUserId != null) {
            var villageOpt = craftVillageRepository.findByVillageAdminIdAndIsDeletedFalse(adminUserId);
            if (villageOpt.isPresent()) {
                return villageOpt.get();
            }
        }
        if (villageIdFallback != null) {
            return craftVillageRepository.findById(villageIdFallback)
                    .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy thông tin làng nghề"));
        }
        List<CraftVillage> all = craftVillageRepository.findByIsDeletedFalseAndIsActiveTrue();
        if (!all.isEmpty()) {
            return all.get(0);
        }
        throw new BusinessException("NOT_FOUND", "Chưa có dữ liệu làng nghề trong hệ thống");
    }

    @Transactional
    public CraftVillage updateVillageProfile(Long villageId, UpdateVillageProfileRequest request) {
        CraftVillage village = craftVillageRepository.findById(villageId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy làng nghề với ID: " + villageId));

        if (request.getName() != null && !request.getName().isBlank()) {
            village.setName(request.getName().trim());
        }
        if (request.getCraftType() != null) {
            village.setCraftType(request.getCraftType().trim());
        }
        if (request.getRegion() != null) {
            village.setRegion(request.getRegion().trim());
        }
        if (request.getProvince() != null) {
            village.setProvince(request.getProvince().trim());
        }
        if (request.getDistrict() != null) {
            village.setDistrict(request.getDistrict().trim());
        }
        if (request.getAddressLine() != null) {
            village.setAddressLine(request.getAddressLine().trim());
        }
        if (request.getHistoricalSummary() != null) {
            village.setHistoricalSummary(request.getHistoricalSummary().trim());
        }
        if (request.getFoundingYearEstimate() != null) {
            village.setFoundingYearEstimate(request.getFoundingYearEstimate());
        }
        if (request.getAncestorWorshipInfo() != null) {
            village.setAncestorWorshipInfo(request.getAncestorWorshipInfo());
        }
        if (request.getLatitude() != null) {
            village.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            village.setLongitude(request.getLongitude());
        }
        if (request.getCoverageRadiusMeters() != null) {
            village.setCoverageRadiusMeters(request.getCoverageRadiusMeters());
        }
        if (request.getCoverImageUrl() != null) {
            village.setCoverImageUrl(request.getCoverImageUrl());
        }

        village.syncGeometryCoordinates();
        log.info("[VILLAGE] Cập nhật thông tin làng nghề: {} (id={})", village.getName(), village.getId());
        return craftVillageRepository.save(village);
    }

    @Transactional(readOnly = true)
    public List<ArtisanProfile> getArtisansForVillage(Long villageId) {
        return artisanProfileRepository.findByCraftVillageIdAndIsDeletedFalse(villageId);
    }

    @Transactional
    public ProxyArtisanResponse createProxyArtisan(Long adminUserId, ProxyArtisanCreateRequest request) {
        User adminUser = null;
        if (adminUserId != null) {
            adminUser = userRepository.findById(adminUserId).orElse(null);
        }

        CraftVillage village = null;
        if (request.getVillageId() != null) {
            village = craftVillageRepository.findById(request.getVillageId()).orElse(null);
        } else if (adminUser != null) {
            village = craftVillageRepository.findByVillageAdminIdAndIsDeletedFalse(adminUser.getId()).orElse(null);
        }
        if (village == null) {
            List<CraftVillage> all = craftVillageRepository.findByIsDeletedFalseAndIsActiveTrue();
            village = all.isEmpty() ? null : all.get(0);
        }
        if (village == null) {
            throw new BusinessException("VILLAGE_REQUIRED", "Không xác định được làng nghề quản lý để tạo nghệ nhân");
        }

        String activationCode = "ACT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String tempUsername = "artisan_" + System.currentTimeMillis() % 1000000;
        String tempEmail = tempUsername + "@craft." + village.getSlug() + ".vn";

        User artisanUser = User.builder()
                .username(tempUsername)
                .email(tempEmail)
                .phone(request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone().trim() : null)
                .fullName(request.getFullName().trim())
                .passwordHash(passwordEncoder.encode("HeritageArtisan@2026"))
                .role("ROLE_ARTISAN")
                .status("ACTIVE")
                .build();

        User savedArtisanUser = userRepository.save(artisanUser);

        ArtisanProfile profile = ArtisanProfile.builder()
                .user(savedArtisanUser)
                .craftVillage(village)
                .isIndependent(false)
                .managedByVillageAdmin(true) // Cờ đại diện cho nghệ nhân cao tuổi
                .representativeAdmin(adminUser)
                .title(request.getTitle().trim())
                .bio(request.getBio() != null ? request.getBio().trim() : "Nghệ nhân truyền thống làng nghề " + village.getName())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 10)
                .workshopAddress(request.getWorkshopAddress() != null ? request.getWorkshopAddress().trim() : village.getAddressLine())
                .specialtySkills(request.getSpecialtySkills())
                .activationToken(activationCode)
                .verificationStatus("APPROVED") // Quản lý làng trực tiếp tạo nên duyệt luôn
                .approvedBy(adminUser)
                .approvedAt(Instant.now())
                .build();

        ArtisanProfile savedProfile = artisanProfileRepository.save(profile);
        log.info("[VILLAGE] Tạo tài khoản đại diện thành công cho nghệ nhân: {} (code={})", savedProfile.getTitle(), activationCode);

        return ProxyArtisanResponse.builder()
                .artisanId(savedProfile.getId())
                .userId(savedArtisanUser.getId())
                .fullName(savedArtisanUser.getFullName())
                .phone(savedArtisanUser.getPhone())
                .title(savedProfile.getTitle())
                .activationCode(activationCode)
                .workshopAddress(savedProfile.getWorkshopAddress())
                .managedByVillageAdmin(true)
                .status(savedProfile.getVerificationStatus())
                .villageName(village.getName())
                .build();
    }

    @Transactional
    public ArtisanProfile reviewArtisan(Long artisanId, Long adminUserId, ReviewArtisanRequest request) {
        ArtisanProfile profile = artisanProfileRepository.findById(artisanId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân với ID: " + artisanId));

        User adminUser = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        String targetStatus = request.getStatus().trim().toUpperCase();
        if ("REJECTED".equals(targetStatus)) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BusinessException("VALIDATION_ERROR", "Lý do từ chối không được để trống khi từ chối hồ sơ nghệ nhân");
            }
            profile.setVerificationStatus("REJECTED");
            profile.setRejectionReason(request.getRejectionReason().trim());
            log.info("[VILLAGE] Từ chối hồ sơ nghệ nhân ID: {}, Lý do: {}", artisanId, request.getRejectionReason());
        } else if ("APPROVED".equals(targetStatus) || "VERIFIED".equals(targetStatus)) {
            profile.setVerificationStatus("APPROVED");
            profile.setApprovedBy(adminUser);
            profile.setApprovedAt(Instant.now());
            profile.setRejectionReason(null);
            log.info("[VILLAGE] Phê duyệt hồ sơ nghệ nhân ID: {}", artisanId);
        } else {
            throw new BusinessException("INVALID_STATUS", "Trạng thái phê duyệt không hợp lệ: " + targetStatus);
        }

        return artisanProfileRepository.save(profile);
    }
}
