package com.heritage.platform;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.crowdfunding.dto.CampaignResponses;
import com.heritage.platform.modules.crowdfunding.dto.DonationDTOs;
import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingCampaign;
import com.heritage.platform.modules.crowdfunding.repository.CrowdfundingCampaignRepository;
import com.heritage.platform.modules.crowdfunding.service.CrowdfundingService;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.service.AntiCounterfeitService;
import com.heritage.platform.modules.tour.dto.TourBookingDTOs;
import com.heritage.platform.modules.tour.entity.HeritageTour;
import com.heritage.platform.modules.tour.repository.HeritageTourRepository;
import com.heritage.platform.modules.tour.service.HeritageTourService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CommunityPreservationAndTourTest {

    @Autowired
    private HeritageTourService tourService;

    @Autowired
    private HeritageTourRepository tourRepository;

    @Autowired
    private CrowdfundingService crowdfundingService;

    @Autowired
    private CrowdfundingCampaignRepository campaignRepository;

    @Autowired
    private AntiCounterfeitService antiCounterfeitService;

    @Autowired
    private HeritagePassportRepository passportRepository;

    @Test
    @DisplayName("Đặt tour trải nghiệm thành công, sinh mã vé QR và giữ chỗ")
    void testTourBooking_Success() {
        HeritageTour tour = tourRepository.findAll().stream().findFirst().orElseThrow();

        TourBookingDTOs.BookingRequest req = TourBookingDTOs.BookingRequest.builder()
                .tourId(tour.getId())
                .customerName("Pham Quang Huy")
                .contactPhone("0981122334")
                .bookingDate(LocalDate.now().plusDays(5))
                .sessionTime("MORNING")
                .numberOfGuests(2)
                .build();

        TourBookingDTOs.BookingResponse res = tourService.bookTour(null, req);

        assertNotNull(res);
        assertNotNull(res.getTicketQrCode());
        assertTrue(res.getTicketQrCode().startsWith("TKT-"));
        assertEquals("PAID", res.getPaymentStatus());
        assertEquals(tour.getPricePerPerson().multiply(BigDecimal.valueOf(2)), res.getTotalAmount());
    }

    @Test
    @DisplayName("Hủy vé tour thất bại khi thời gian đến ca trải nghiệm < 24 giờ")
    void testCancelTour_Within24h_ThrowsException() {
        HeritageTour tour = tourRepository.findAll().stream().findFirst().orElseThrow();

        // Đặt vé cho ngày hôm nay (thời gian < 24h)
        TourBookingDTOs.BookingRequest req = TourBookingDTOs.BookingRequest.builder()
                .tourId(tour.getId())
                .customerName("Tran Thi Mai")
                .contactPhone("0977665544")
                .bookingDate(LocalDate.now())
                .sessionTime("MORNING")
                .numberOfGuests(1)
                .build();

        TourBookingDTOs.BookingResponse res = tourService.bookTour(null, req);

        assertThrows(BusinessException.class, () -> tourService.cancelBooking(res.getBookingId(), null, "Ly do ca nhan"));
    }

    @Test
    @DisplayName("Đóng góp gây quỹ bảo tồn tăng số tiền hiện tại và phòng chống lỗi chia cho 0 khi tính % tiến độ")
    void testCrowdfunding_Donation_And_ZeroDivisionProtection() {
        CrowdfundingCampaign campaign = campaignRepository.findAll().stream().findFirst().orElseThrow();
        BigDecimal initialAmount = campaign.getCurrentAmount();
        BigDecimal donationAmount = new BigDecimal("200000.00");

        DonationDTOs.DonateRequest req = DonationDTOs.DonateRequest.builder()
                .donorName("Nha Hao Tam Test")
                .donorEmail("donor@heritage.vn")
                .amount(donationAmount)
                .isAnonymous(false)
                .message("Chuc lang gom ngay cang phat trien")
                .build();

        DonationDTOs.DonationResponse res = crowdfundingService.donate(campaign.getId(), null, req);

        assertNotNull(res);
        assertEquals("PAID", res.getPaymentStatus());

        CrowdfundingCampaign updated = campaignRepository.findById(campaign.getId()).orElseThrow();
        assertEquals(initialAmount.add(donationAmount), updated.getCurrentAmount());

        // Kiểm tra tính phần trăm không bị lỗi chia cho 0
        CampaignResponses.CampaignDetailResponse detail = crowdfundingService.getCampaignById(campaign.getId());
        assertTrue(detail.getProgressPercentage() >= 0.0);
    }

    @Test
    @DisplayName("Thuật toán Vận tốc Di chuyển Bất khả thi: Quét cách nhau 650km trong 2 phút -> Phát hiện COUNTERFEIT_BLOCKED")
    void testAntiCounterfeit_ImpossibleTravelVelocityAnomaly() {
        HeritagePassport passport = passportRepository.findAll().stream().findFirst().orElseThrow();

        // Lượt quét 1: Tại Hà Nội
        PassportAuditLog lastScan = PassportAuditLog.builder()
                .passport(passport)
                .latitude(21.0285)
                .longitude(105.8542)
                .scannedAt(Instant.now().minus(2, ChronoUnit.MINUTES))
                .accuracyLevel("GPS_HIGH_ACCURACY")
                .isAnomaly(false)
                .build();

        // Lượt quét 2: Tại Đà Nẵng (cách 650km) 2 phút sau
        AntiCounterfeitService.VerificationResult result = antiCounterfeitService.evaluateScanVelocity(
                lastScan,
                16.0544,
                108.2022,
                "GPS_HIGH_ACCURACY",
                Instant.now()
        );

        // V > 900 km/h và D > 100km trong < 5 phút -> kích hoạt COUNTERFEIT_BLOCKED
        assertEquals(AntiCounterfeitService.VerificationResult.COUNTERFEIT_BLOCKED, result);
    }
}
