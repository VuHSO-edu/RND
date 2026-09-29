package com.heritage.platform.modules.passport.repository;

import com.heritage.platform.modules.passport.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
    Optional<ProductBatch> findByBatchCode(String batchCode);
    List<ProductBatch> findByCraftVillageIdOrderByCreatedAtDesc(Long villageId);
    List<ProductBatch> findByApprovalStatusOrderByCreatedAtDesc(String approvalStatus);
    List<ProductBatch> findByCraftVillageIdAndApprovalStatusOrderByCreatedAtDesc(Long villageId, String approvalStatus);
    List<ProductBatch> findByArtisanIdOrderByCreatedAtDesc(Long artisanId);
}
