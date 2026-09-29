package com.heritage.platform.modules.admin.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.admin.dto.VerifyVillageRequest;
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
public class AdminVillageService {

    private final CraftVillageRepository craftVillageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CraftVillage> getPendingVillages() {
        return craftVillageRepository.findByVerificationStatusAndIsDeletedFalse("PENDING");
    }

    @Transactional
    public CraftVillage verifyVillage(Long id, VerifyVillageRequest request) {
        CraftVillage village = craftVillageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy hồ sơ làng nghề với ID: " + id));

        if (Boolean.TRUE.equals(request.getApproved())) {
            village.setVerificationStatus("APPROVED");
            village.setIsActive(true);
            village.setRejectionReason(null);

            if (request.getVillageAdminUserId() != null) {
                User adminUser = userRepository.findById(request.getVillageAdminUserId())
                        .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tài khoản quản lý với ID: " + request.getVillageAdminUserId()));
                adminUser.setStatus("ACTIVE");
                userRepository.save(adminUser);
                village.setVillageAdmin(adminUser);
            } else if (village.getVillageAdmin() != null) {
                User currentAdmin = village.getVillageAdmin();
                currentAdmin.setStatus("ACTIVE");
                userRepository.save(currentAdmin);
            }

            log.info("[ADMIN] Phê duyệt hồ sơ làng nghề thành công: {} (id={})", village.getName(), village.getId());
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BusinessException("VALIDATION_ERROR", "Lý do từ chối không được để trống khi từ chối hồ sơ");
            }
            village.setVerificationStatus("REJECTED");
            village.setRejectionReason(request.getRejectionReason().trim());
            village.setIsActive(false);
            log.info("[ADMIN] Từ chối hồ sơ làng nghề: {} (id={}), Lý do: {}", village.getName(), village.getId(), request.getRejectionReason());
        }

        return craftVillageRepository.save(village);
    }
}
