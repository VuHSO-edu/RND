package com.heritage.platform.modules.artisan.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.dto.ArtisanPublicProfileResponse;
import com.heritage.platform.modules.artisan.dto.CreateArtisanRequest;
import com.heritage.platform.modules.artisan.dto.UpdateArtisanProfileRequest;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtisanService {

    private final ArtisanProfileRepository artisanProfileRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CraftVillageRepository craftVillageRepository;

    @Transactional(readOnly = true)
    public List<ArtisanProfile> getVerifiedArtisans() {
        return artisanProfileRepository.findByVerificationStatusAndIsDeletedFalse("VERIFIED");
    }

    @Transactional(readOnly = true)
    public ArtisanProfile getArtisanById(Long id) {
        return artisanProfileRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân"));
    }

    @Transactional(readOnly = true)
    public ArtisanProfile getArtisanByUserId(Long userId) {
        return artisanProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Tài khoản chưa đăng ký hồ sơ nghệ nhân"));
    }

    /**
     * Tạo mới hồ sơ nghệ nhân bởi Quản lý làng (Village Admin)
     */
    @Transactional
    public ArtisanProfile createArtisanProfile(Long adminUserId, CreateArtisanRequest req) {
        User adminUser = null;
        if (adminUserId != null) {
            adminUser = userRepository.findById(adminUserId).orElse(null);
        }

        CraftVillage village = null;
        if (req.getCraftVillageId() != null) {
            village = craftVillageRepository.findById(req.getCraftVillageId()).orElse(null);
        }

        String phone = (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank())
                ? req.getPhoneNumber().trim()
                : "09" + System.currentTimeMillis() % 100000000;

        String email = "artisan." + UUID.randomUUID().toString().substring(0, 8) + "@heritage.domain.vn";

        // Tạo tài khoản User định danh cho Nghệ nhân
        User artisanUser = User.builder()
                .username("artisan_" + UUID.randomUUID().toString().substring(0, 6))
                .email(email)
                .phone(phone)
                .fullName(req.getFullName().trim())
                .passwordHash("$2a$10$dummyHashGeneratedForArtisanInitialAccess12345")
                .role("ROLE_ARTISAN")
                .status("ACTIVE")
                .build();
        artisanUser = userRepository.saveAndFlush(artisanUser);

        String certificationsJson = req.getCertifications() != null ? req.getCertifications().toString() : null;

        ArtisanProfile profile = ArtisanProfile.builder()
                .user(artisanUser)
                .craftVillage(village)
                .representativeAdmin(adminUser)
                .managedByVillageAdmin(true)
                .title(req.getTitle() != null ? req.getTitle().trim() : "Nghệ nhân Làng nghề")
                .bio(req.getBio() != null ? req.getBio().trim() : "Nghệ nhân chế tác thủ công truyền thống.")
                .philosophy(req.getPhilosophy() != null ? req.getPhilosophy().trim() : "Gốm không chỉ là đất, gốm là hồn người nương vào lửa.")
                .interviewMediaUrl(req.getInterviewMediaUrl())
                .specialtySkills(req.getSpecialtySkills())
                .experienceYears(req.getYearsOfExperience() != null ? req.getYearsOfExperience() : 20)
                .workshopAddress(req.getWorkshopAddress() != null ? req.getWorkshopAddress().trim() : "Làng nghề truyền thống")
                .certifications(certificationsJson)
                .verificationStatus("APPROVED")
                .activationToken(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        ArtisanProfile saved = artisanProfileRepository.saveAndFlush(profile);
        log.info("[ARTISAN_CREATED] Quản lý làng đã tạo hồ sơ nghệ nhân: {} (ID: {})", saved.getUser().getFullName(), saved.getId());
        return saved;
    }

    /**
     * Lấy hồ sơ công khai kèm video phỏng vấn và các tác phẩm tiêu biểu
     */
    @Transactional(readOnly = true)
    public ArtisanPublicProfileResponse getPublicProfile(Long artisanId) {
        ArtisanProfile profile = getArtisanById(artisanId);
        List<Product> products = productRepository.findByArtisanIdAndIsDeletedFalse(artisanId);

        return ArtisanPublicProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : "Nghệ Nhân Làng Nghề")
                .title(profile.getTitle())
                .craftVillageName(profile.getCraftVillage() != null ? profile.getCraftVillage().getName() : "Làng Nghề Truyền Thống")
                .province(profile.getCraftVillage() != null ? profile.getCraftVillage().getProvince() : "Việt Nam")
                .bio(profile.getBio())
                .philosophy(profile.getPhilosophy())
                .interviewMediaUrl(profile.getInterviewMediaUrl())
                .experienceYears(profile.getExperienceYears())
                .specialtySkills(profile.getSpecialtySkills())
                .workshopAddress(profile.getWorkshopAddress())
                .certifications(profile.getCertifications())
                .representativeProducts(products)
                .build();
    }

    /**
     * Nghệ nhân tự cập nhật tiểu sử, triết lý làm nghề
     */
    @Transactional
    public ArtisanProfile updateArtisanProfile(Long userId, UpdateArtisanProfileRequest req) {
        ArtisanProfile profile = getArtisanByUserId(userId);

        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            profile.setTitle(req.getTitle().trim());
        }
        if (req.getBio() != null && !req.getBio().isBlank()) {
            profile.setBio(req.getBio().trim());
        }
        if (req.getPhilosophy() != null && !req.getPhilosophy().isBlank()) {
            profile.setPhilosophy(req.getPhilosophy().trim());
        }
        if (req.getSpecialtySkills() != null && !req.getSpecialtySkills().isBlank()) {
            profile.setSpecialtySkills(req.getSpecialtySkills().trim());
        }
        if (req.getInterviewMediaUrl() != null && !req.getInterviewMediaUrl().isBlank()) {
            profile.setInterviewMediaUrl(req.getInterviewMediaUrl().trim());
        }
        if (req.getWorkshopAddress() != null && !req.getWorkshopAddress().isBlank()) {
            profile.setWorkshopAddress(req.getWorkshopAddress().trim());
        }
        if (req.getYearsOfExperience() != null) {
            profile.setExperienceYears(req.getYearsOfExperience());
        }

        return artisanProfileRepository.save(profile);
    }
}
