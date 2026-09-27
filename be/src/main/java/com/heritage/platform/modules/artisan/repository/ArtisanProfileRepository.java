package com.heritage.platform.modules.artisan.repository;

import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtisanProfileRepository extends JpaRepository<ArtisanProfile, Long> {

    @EntityGraph(attributePaths = {"user", "craftVillage"})
    List<ArtisanProfile> findByVerificationStatusAndIsDeletedFalse(String verificationStatus);

    @EntityGraph(attributePaths = {"user", "craftVillage"})
    Optional<ArtisanProfile> findByIdAndIsDeletedFalse(Long id);

    @EntityGraph(attributePaths = {"user", "craftVillage"})
    Optional<ArtisanProfile> findByUserIdAndIsDeletedFalse(Long userId);
}
