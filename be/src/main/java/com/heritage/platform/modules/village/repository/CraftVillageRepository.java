package com.heritage.platform.modules.village.repository;

import com.heritage.platform.modules.village.entity.CraftVillage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CraftVillageRepository extends JpaRepository<CraftVillage, Long> {
    List<CraftVillage> findByIsDeletedFalseAndIsActiveTrue();
    Optional<CraftVillage> findBySlugAndIsDeletedFalse(String slug);
    List<CraftVillage> findByRegionAndIsDeletedFalse(String region);
    Optional<CraftVillage> findByVillageAdminIdAndIsDeletedFalse(Long villageAdminId);
    List<CraftVillage> findByVerificationStatusAndIsDeletedFalse(String verificationStatus);
}
