package com.heritage.platform.modules.crowdfunding.repository;

import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingCampaign;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CrowdfundingCampaignRepository extends JpaRepository<CrowdfundingCampaign, UUID> {

    @EntityGraph(attributePaths = {"craftVillage", "targetArtisan"})
    Optional<CrowdfundingCampaign> findByIdAndIsDeletedFalse(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CrowdfundingCampaign c WHERE c.id = :id AND c.isDeleted = false")
    Optional<CrowdfundingCampaign> findByIdForUpdate(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"craftVillage", "targetArtisan"})
    List<CrowdfundingCampaign> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(String status);

    @EntityGraph(attributePaths = {"craftVillage", "targetArtisan"})
    List<CrowdfundingCampaign> findByCraftVillageIdAndIsDeletedFalseOrderByCreatedAtDesc(Long villageId);

    // Tìm các chiến dịch đang ACTIVE nhưng đã quá hạn deadline để xử lý hoàn tiền hoặc nghiệm thu
    @Query("SELECT c FROM CrowdfundingCampaign c WHERE c.isDeleted = false AND c.status = 'ACTIVE' AND c.deadline < :today")
    List<CrowdfundingCampaign> findExpiredActiveCampaigns(@Param("today") LocalDate today);
}
