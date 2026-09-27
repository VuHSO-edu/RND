package com.heritage.platform.modules.gis.repository;

import com.heritage.platform.modules.gis.entity.PowerAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PowerAssetRepository extends JpaRepository<PowerAsset, Long> {
    List<PowerAsset> findByAssetTypeAndIsDeletedFalse(String assetType);
    Optional<PowerAsset> findByCodeAndIsDeletedFalse(String code);
    boolean existsByCode(String code);
    long countByAssetTypeAndIsDeletedFalse(String assetType);
}
