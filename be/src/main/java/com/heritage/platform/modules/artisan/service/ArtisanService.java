package com.heritage.platform.modules.artisan.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtisanService {

    private final ArtisanProfileRepository artisanProfileRepository;

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
}
