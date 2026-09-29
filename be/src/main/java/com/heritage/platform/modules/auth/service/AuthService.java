package com.heritage.platform.modules.auth.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.auth.dto.AuthResponse;
import com.heritage.platform.modules.auth.dto.LoginRequest;
import com.heritage.platform.modules.auth.dto.RegisterRequest;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import com.heritage.platform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        String cleanPhone = request.getPhone() != null ? request.getPhone().trim() : null;

        if ((cleanEmail == null || cleanEmail.isBlank()) && (cleanPhone == null || cleanPhone.isBlank())) {
            throw new BusinessException("VALIDATION_ERROR", "Cần cung cấp ít nhất Email hoặc Số điện thoại để đăng ký");
        }

        if (cleanEmail != null && !cleanEmail.isBlank() && userRepository.existsByEmail(cleanEmail)) {
            throw new BusinessException("DUPLICATE_KEY", "Email '" + cleanEmail + "' đã được sử dụng");
        }

        if (cleanPhone != null && !cleanPhone.isBlank() && userRepository.findByPhone(cleanPhone).isPresent()) {
            throw new BusinessException("DUPLICATE_KEY", "Số điện thoại '" + cleanPhone + "' đã được sử dụng");
        }

        String targetRole = request.getRole() != null ? request.getRole() : "ROLE_CUSTOMER";
        String initialStatus = "ACTIVE";

        if ("ROLE_VILLAGE_ADMIN".equalsIgnoreCase(targetRole)) {
            initialStatus = "PENDING_VERIFICATION";
        }

        String generatedUsername = cleanEmail != null && !cleanEmail.isBlank() 
                ? cleanEmail.split("@")[0] 
                : "user_" + System.currentTimeMillis();
        
        // Tránh trùng username
        if (userRepository.existsByUsername(generatedUsername)) {
            generatedUsername = generatedUsername + "_" + System.currentTimeMillis() % 1000;
        }

        User user = User.builder()
                .username(generatedUsername)
                .email(cleanEmail != null ? cleanEmail : generatedUsername + "@heritage.vn")
                .phone(cleanPhone)
                .fullName(request.getFullName().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword().trim()))
                .role(targetRole.toUpperCase())
                .status(initialStatus)
                .build();

        User savedUser = userRepository.save(user);

        Long villageId = null;
        String villageName = null;
        Long artisanId = null;
        String artisanTitle = null;
        String verificationStatus = null;

        // Nếu là Quản lý làng: Tạo hồ sơ Làng nghề ở trạng thái PENDING, village_admin = NULL để phá vỡ Circular FK!
        if ("ROLE_VILLAGE_ADMIN".equalsIgnoreCase(targetRole)) {
            String vName = request.getVillageName() != null ? request.getVillageName().trim() : "Làng nghề " + request.getFullName();
            String slug = toSlug(vName) + "-" + savedUser.getId();
            
            CraftVillage village = CraftVillage.builder()
                    .name(vName)
                    .slug(slug)
                    .craftType(request.getCraftType() != null ? request.getCraftType().trim() : "Thủ công truyền thống")
                    .region(request.getRegion() != null ? request.getRegion().trim() : "Bac_Bo")
                    .province(request.getProvince() != null ? request.getProvince().trim() : "Hà Nội")
                    .district(request.getDistrict() != null ? request.getDistrict().trim() : "")
                    .addressLine(request.getAddressLine() != null ? request.getAddressLine().trim() : "")
                    .historicalSummary(request.getHistoricalSummary() != null ? request.getHistoricalSummary().trim() : "Hồ sơ làng nghề đang chờ duyệt")
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 21.0)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 105.8)
                    .coverageRadiusMeters(5000)
                    .verificationStatus("PENDING")
                    .isActive(false)
                    .villageAdmin(null) // Phá vỡ Circular FK! Super Admin sẽ gán sau khi duyệt
                    .build();

            CraftVillage savedVillage = craftVillageRepository.save(village);
            villageId = savedVillage.getId();
            villageName = savedVillage.getName();
            verificationStatus = "PENDING";
            log.info("[AUTH] Tạo đăng ký Làng nghề chờ duyệt: id={}, name={}", villageId, villageName);
        }

        // Nếu là Nghệ nhân: Tạo hồ sơ Nghệ nhân
        if ("ROLE_ARTISAN".equalsIgnoreCase(targetRole)) {
            CraftVillage village = null;
            if (request.getVillageId() != null) {
                village = craftVillageRepository.findById(request.getVillageId()).orElse(null);
            }

            ArtisanProfile profile = ArtisanProfile.builder()
                    .user(savedUser)
                    .craftVillage(village)
                    .isIndependent(Boolean.TRUE.equals(request.getIsIndependent()))
                    .title(request.getTitle() != null ? request.getTitle().trim() : "Nghệ nhân")
                    .bio(request.getBio() != null ? request.getBio().trim() : "Đang cập nhật tiểu sử")
                    .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 1)
                    .workshopAddress(request.getWorkshopAddress() != null ? request.getWorkshopAddress().trim() : "Tại xưởng chế tác")
                    .verificationStatus("PENDING")
                    .build();

            ArtisanProfile savedProfile = artisanProfileRepository.save(profile);
            artisanId = savedProfile.getId();
            artisanTitle = savedProfile.getTitle();
            verificationStatus = "PENDING";
            if (village != null) {
                villageId = village.getId();
                villageName = village.getName();
            }
        }

        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .avatarUrl(savedUser.getAvatarUrl())
                .villageId(villageId)
                .villageName(villageName)
                .artisanId(artisanId)
                .artisanTitle(artisanTitle)
                .verificationStatus(verificationStatus)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByPhone(identifier))
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new BusinessException("INVALID_CREDENTIALS", "Tài khoản hoặc mật khẩu không chính xác"));

        if (user.isDeleted() || "DELETED".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessException("ACCOUNT_DEACTIVATED", "Tài khoản này đã bị ngừng hoạt động");
        }

        if (!passwordEncoder.matches(request.getPassword().trim(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_CREDENTIALS", "Tài khoản hoặc mật khẩu không chính xác");
        }

        Long villageId = null;
        String villageName = null;
        Long artisanId = null;
        String artisanTitle = null;
        String verificationStatus = null;

        if ("ROLE_VILLAGE_ADMIN".equalsIgnoreCase(user.getRole())) {
            var villageOpt = craftVillageRepository.findByVillageAdminIdAndIsDeletedFalse(user.getId());
            if (villageOpt.isPresent()) {
                CraftVillage v = villageOpt.get();
                villageId = v.getId();
                villageName = v.getName();
                verificationStatus = v.getVerificationStatus();
            }
        } else if ("ROLE_ARTISAN".equalsIgnoreCase(user.getRole())) {
            var artisanOpt = artisanProfileRepository.findByUserIdAndIsDeletedFalse(user.getId());
            if (artisanOpt.isPresent()) {
                ArtisanProfile ap = artisanOpt.get();
                artisanId = ap.getId();
                artisanTitle = ap.getTitle();
                verificationStatus = ap.getVerificationStatus();
                if (ap.getCraftVillage() != null) {
                    villageId = ap.getCraftVillage().getId();
                    villageName = ap.getCraftVillage().getName();
                }
            }
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .villageId(villageId)
                .villageName(villageName)
                .artisanId(artisanId)
                .artisanTitle(artisanTitle)
                .verificationStatus(verificationStatus)
                .build();
    }

    private String toSlug(String input) {
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[\\p{InCombiningDiacriticalMarks}]").matcher(normalized).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH).replaceAll("[^a-z0-9-]", "");
        return slug.replaceAll("-+", "-");
    }
}
