package com.heritage.platform.modules.crowdfunding.repository;

import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingDonation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CrowdfundingDonationRepository extends JpaRepository<CrowdfundingDonation, UUID> {

    @EntityGraph(attributePaths = {"donorUser"})
    List<CrowdfundingDonation> findByCampaignIdAndPaymentStatusOrderByDonatedAtDesc(UUID campaignId, String paymentStatus);

    // Lấy 10 lượt quyên góp gần nhất của chiến dịch
    List<CrowdfundingDonation> findTop10ByCampaignIdAndPaymentStatusOrderByDonatedAtDesc(UUID campaignId, String paymentStatus);

    @Query("SELECT COUNT(d) FROM CrowdfundingDonation d WHERE d.campaign.id = :campaignId AND d.paymentStatus = 'PAID'")
    Long countPaidDonations(@Param("campaignId") UUID campaignId);
}
