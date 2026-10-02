package com.heritage.platform.modules.crowdfunding.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.crowdfunding.dto.CampaignResponses;
import com.heritage.platform.modules.crowdfunding.dto.CreateCampaignRequest;
import com.heritage.platform.modules.crowdfunding.dto.DonationDTOs;
import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingCampaign;
import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingDonation;
import com.heritage.platform.modules.crowdfunding.repository.CrowdfundingCampaignRepository;
import com.heritage.platform.modules.crowdfunding.repository.CrowdfundingDonationRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrowdfundingService {

    private final CrowdfundingCampaignRepository campaignRepository;
    private final CrowdfundingDonationRepository donationRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public CampaignResponses.CreateResponse createCampaign(Long adminUserId, CreateCampaignRequest req) {
        CraftVillage village = req.getCraftVillageId() != null 
                ? craftVillageRepository.findById(req.getCraftVillageId()).orElse(null) 
                : null;
        ArtisanProfile artisan = req.getTargetArtisanId() != null 
                ? artisanProfileRepository.findById(req.getTargetArtisanId()).orElse(null) 
                : null;

        String tiersJson = null;
        if (req.getRewardTiers() != null && !req.getRewardTiers().isEmpty()) {
            try {
                tiersJson = objectMapper.writeValueAsString(req.getRewardTiers());
            } catch (Exception e) {
                tiersJson = req.getRewardTiers().toString();
            }
        }

        CrowdfundingCampaign campaign = CrowdfundingCampaign.builder()
                .craftVillage(village)
                .targetArtisan(artisan)
                .title(req.getTitle().trim())
                .storyContent(req.getStoryContent())
                .coverImageUrl(req.getCoverImageUrl())
                .targetAmount(req.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .startDate(req.getStartDate())
                .deadline(req.getDeadline())
                .donorsCount(0)
                .fundingType(req.getFundingType() != null ? req.getFundingType() : "ALL_OR_NOTHING")
                .rewardTiers(tiersJson)
                .status("ACTIVE")
                .build();

        CrowdfundingCampaign saved = campaignRepository.save(campaign);
        log.info("[CROWDFUND] Khởi tạo chiến dịch gây quỹ: {} (id={}, target={})", saved.getTitle(), saved.getId(), saved.getTargetAmount());

        return CampaignResponses.CreateResponse.builder()
                .campaignId(saved.getId())
                .status(saved.getStatus())
                .targetAmount(saved.getTargetAmount())
                .currentAmount(saved.getCurrentAmount())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CampaignResponses.CampaignSummaryResponse> getCampaigns() {
        List<CrowdfundingCampaign> list = campaignRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc("ACTIVE");
        LocalDate today = LocalDate.now();

        return list.stream().map(c -> {
            double percent = c.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                    ? c.getCurrentAmount().multiply(BigDecimal.valueOf(100))
                        .divide(c.getTargetAmount(), 1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            long daysLeft = Math.max(0, ChronoUnit.DAYS.between(today, c.getDeadline()));

            return CampaignResponses.CampaignSummaryResponse.builder()
                    .id(c.getId())
                    .title(c.getTitle())
                    .coverImageUrl(c.getCoverImageUrl())
                    .targetAmount(c.getTargetAmount())
                    .currentAmount(c.getCurrentAmount())
                    .progressPercentage(percent)
                    .donorsCount(c.getDonorsCount())
                    .daysRemaining(daysLeft)
                    .status(c.getStatus())
                    .fundingType(c.getFundingType())
                    .villageName(c.getCraftVillage() != null ? c.getCraftVillage().getName() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampaignResponses.CampaignDetailResponse getCampaignById(UUID id) {
        CrowdfundingCampaign c = campaignRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy chiến dịch với ID: " + id));

        LocalDate today = LocalDate.now();
        double percent = c.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? c.getCurrentAmount().multiply(BigDecimal.valueOf(100))
                    .divide(c.getTargetAmount(), 1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        long daysLeft = Math.max(0, ChronoUnit.DAYS.between(today, c.getDeadline()));

        List<Object> tiers = Collections.emptyList();
        if (c.getRewardTiers() != null && !c.getRewardTiers().isBlank()) {
            try {
                tiers = objectMapper.readValue(c.getRewardTiers(), new TypeReference<List<Object>>() {});
            } catch (Exception ignored) {}
        }

        List<CrowdfundingDonation> recent = donationRepository.findTop10ByCampaignIdAndPaymentStatusOrderByDonatedAtDesc(c.getId(), "PAID");
        List<CampaignResponses.RecentDonationDTO> recentDonations = recent.stream().map(d -> {
            String maskedName = d.getDonorName();
            if (Boolean.TRUE.equals(d.getIsAnonymous()) && maskedName != null && maskedName.length() > 2) {
                maskedName = maskedName.charAt(0) + "*** " + maskedName.charAt(maskedName.length() - 1);
            }
            return CampaignResponses.RecentDonationDTO.builder()
                    .donorName(maskedName)
                    .amount(d.getAmount())
                    .message(d.getMessage())
                    .donatedAt(d.getDonatedAt())
                    .build();
        }).collect(Collectors.toList());

        return CampaignResponses.CampaignDetailResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .storyContent(c.getStoryContent())
                .coverImageUrl(c.getCoverImageUrl())
                .targetAmount(c.getTargetAmount())
                .currentAmount(c.getCurrentAmount())
                .progressPercentage(percent)
                .donorsCount(c.getDonorsCount())
                .daysRemaining(daysLeft)
                .startDate(c.getStartDate())
                .deadline(c.getDeadline())
                .fundingType(c.getFundingType())
                .status(c.getStatus())
                .village(c.getCraftVillage() != null ? CampaignResponses.VillageInfo.builder()
                        .id(c.getCraftVillage().getId())
                        .name(c.getCraftVillage().getName())
                        .province(c.getCraftVillage().getProvince())
                        .build() : null)
                .artisan(c.getTargetArtisan() != null ? CampaignResponses.ArtisanInfo.builder()
                        .id(c.getTargetArtisan().getId())
                        .name(c.getTargetArtisan().getUser() != null ? c.getTargetArtisan().getUser().getFullName() : c.getTargetArtisan().getTitle())
                        .title(c.getTargetArtisan().getTitle())
                        .build() : null)
                .rewardTiers(tiers)
                .recentDonations(recentDonations)
                .build();
    }

    /**
     * Quyên góp ủng hộ dự án với Khóa Bi-quan (Pessimistic Lock) chống Race Condition
     */
    @Transactional
    public DonationDTOs.DonationResponse donate(UUID campaignId, Long donorUserId, DonationDTOs.DonateRequest req) {
        CrowdfundingCampaign campaign = campaignRepository.findByIdForUpdate(campaignId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy chiến dịch gây quỹ với ID: " + campaignId));

        if (!"ACTIVE".equals(campaign.getStatus())) {
            throw new BusinessException("CAMPAIGN_NOT_ACTIVE", "Chiến dịch gây quỹ hiện không ở trạng thái mở tiếp nhận quyên góp.");
        }

        if (campaign.getDeadline().isBefore(LocalDate.now())) {
            throw new BusinessException("CAMPAIGN_EXPIRED", "Chiến dịch đã kết thúc thời hạn gây quỹ.");
        }

        User donorUser = donorUserId != null ? userRepository.findById(donorUserId).orElse(null) : null;
        String txRef = "DONATE-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        CrowdfundingDonation donation = CrowdfundingDonation.builder()
                .campaign(campaign)
                .donorUser(donorUser)
                .donorName(req.getDonorName().trim())
                .donorEmail(req.getDonorEmail())
                .amount(req.getAmount())
                .isAnonymous(Boolean.TRUE.equals(req.getIsAnonymous()))
                .message(req.getMessage())
                .tierId(req.getTierId())
                .paymentStatus("PAID") // Mô phỏng thanh toán thành công qua VietQR
                .transactionReference(txRef)
                .donatedAt(Instant.now())
                .build();

        donationRepository.save(donation);

        // Cập nhật an toàn tiền và số nhà tài trợ
        campaign.setCurrentAmount(campaign.getCurrentAmount().add(req.getAmount()));
        campaign.setDonorsCount(campaign.getDonorsCount() + 1);

        campaignRepository.save(campaign);
        log.info("[DONATE] Ủng hộ thành công: campaign={}, amount={}, donor={}", campaign.getId(), req.getAmount(), req.getDonorName());

        return DonationDTOs.DonationResponse.builder()
                .donationId(donation.getId())
                .paymentStatus("PAID")
                .amount(donation.getAmount())
                .thankYouMessage("Cảm ơn đóng góp quý báu của bạn dành cho làng nghề Việt Nam!")
                .vietQrPayload("https://img.vietqr.io/image/970422-HERITAGEFUND-compact.png?amount=" + req.getAmount() + "&addInfo=" + txRef)
                .build();
    }

    @Transactional
    public void updateCampaignStatus(UUID campaignId, String newStatus) {
        CrowdfundingCampaign campaign = campaignRepository.findByIdAndIsDeletedFalse(campaignId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy chiến dịch với ID: " + campaignId));

        campaign.setStatus(newStatus.trim().toUpperCase());
        campaignRepository.save(campaign);
        log.info("[CROWDFUND] Đổi trạng thái chiến dịch {}: status={}", campaignId, campaign.getStatus());
    }

    @Transactional
    public void deleteCampaign(UUID campaignId) {
        CrowdfundingCampaign campaign = campaignRepository.findByIdAndIsDeletedFalse(campaignId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy chiến dịch với ID: " + campaignId));

        if (campaign.getDonorsCount() > 0 || campaign.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("CANNOT_DELETE_ACTIVE_FUND", 
                    "Chiến dịch đã có người quyên góp tiền (" + campaign.getCurrentAmount() + " VNĐ), chỉ được đóng chiến dịch để bảo đảm tính minh bạch giải trình!");
        }

        campaign.setDeleted(true);
        campaign.setStatus("CLOSED");
        campaignRepository.save(campaign);
        log.info("[CROWDFUND] Xóa mềm chiến dịch gây quỹ: id={}", campaignId);
    }

    /**
     * Scheduled Worker: Chạy lúc 01:00 AM mỗi ngày kiểm tra các chiến dịch hết hạn
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void processExpiredCampaigns() {
        List<CrowdfundingCampaign> expired = campaignRepository.findExpiredActiveCampaigns(LocalDate.now());

        for (CrowdfundingCampaign c : expired) {
            boolean isAllOrNothing = "ALL_OR_NOTHING".equalsIgnoreCase(c.getFundingType());
            boolean reachedGoal = c.getCurrentAmount().compareTo(c.getTargetAmount()) >= 0;

            if (isAllOrNothing && !reachedGoal) {
                // Thất bại trong mô hình All-or-Nothing -> Tự động hoàn tiền
                c.setStatus("FAILED");
                campaignRepository.save(c);

                List<CrowdfundingDonation> donations = donationRepository.findByCampaignIdAndPaymentStatusOrderByDonatedAtDesc(c.getId(), "PAID");
                for (CrowdfundingDonation d : donations) {
                    d.setPaymentStatus("REFUNDED");
                    d.setRefundedAt(Instant.now());
                    donationRepository.save(d);
                }
                log.warn("[WORKER_REFUND] Chiến dịch {} (All-or-Nothing) thất bại do không đạt mục tiêu. Đã hoàn tiền cho {} nhà hảo tâm.", 
                        c.getTitle(), donations.size());
            } else {
                // Đạt mục tiêu hoặc mô hình Flexible -> Nghiệm thu thành công
                c.setStatus("COMPLETED");
                campaignRepository.save(c);
                log.info("[WORKER_FUND] Chiến dịch {} đạt hạn chót và hoàn thành nghiệm thu giải ngân.", c.getTitle());
            }
        }
    }
}
