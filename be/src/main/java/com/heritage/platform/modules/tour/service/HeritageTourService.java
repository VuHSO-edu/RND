package com.heritage.platform.modules.tour.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.tour.dto.CreateTourRequest;
import com.heritage.platform.modules.tour.dto.TourBookingDTOs;
import com.heritage.platform.modules.tour.dto.TourResponses;
import com.heritage.platform.modules.tour.entity.HeritageTour;
import com.heritage.platform.modules.tour.entity.TourBooking;
import com.heritage.platform.modules.tour.repository.HeritageTourRepository;
import com.heritage.platform.modules.tour.repository.TourBookingRepository;
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
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeritageTourService {

    private final HeritageTourRepository tourRepository;
    private final TourBookingRepository bookingRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Transactional
    public TourResponses.CreateResponse createTour(Long adminUserId, CreateTourRequest req) {
        CraftVillage village = req.getCraftVillageId() != null 
                ? craftVillageRepository.findById(req.getCraftVillageId()).orElse(null) 
                : null;
        ArtisanProfile artisan = req.getArtisanId() != null 
                ? artisanProfileRepository.findById(req.getArtisanId()).orElse(null) 
                : null;

        String imagesJson = null;
        if (req.getImages() != null && !req.getImages().isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(req.getImages());
            } catch (Exception e) {
                imagesJson = req.getImages().toString();
            }
        }

        HeritageTour tour = HeritageTour.builder()
                .craftVillage(village)
                .artisan(artisan)
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .pricePerPerson(req.getPricePerPerson())
                .durationHours(req.getDurationHours())
                .maxSlotsPerSession(req.getMaxSlotsPerSession())
                .includedMaterials(req.getIncludedMaterials())
                .images(imagesJson)
                .status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
                .build();

        HeritageTour saved = tourRepository.save(tour);
        log.info("[TOUR] Tạo khóa học/tour trải nghiệm mới: {} (id={})", saved.getTitle(), saved.getId());

        return TourResponses.CreateResponse.builder()
                .tourId(saved.getId())
                .title(saved.getTitle())
                .status(saved.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TourResponses.TourDetailResponse> getTours(Long villageId, BigDecimal minPrice, BigDecimal maxPrice) {
        List<HeritageTour> list = tourRepository.searchTours(villageId, minPrice, maxPrice);
        return list.stream().map(this::mapToDetailResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TourResponses.TourDetailResponse getTourById(UUID id) {
        HeritageTour tour = tourRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy khóa học/tour với ID: " + id));
        return mapToDetailResponse(tour);
    }

    @Transactional
    public TourResponses.CreateResponse updateTour(UUID tourId, Long adminUserId, CreateTourRequest req) {
        HeritageTour tour = tourRepository.findByIdAndIsDeletedFalse(tourId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tour với ID: " + tourId));

        if (req.getTitle() != null && !req.getTitle().isBlank()) tour.setTitle(req.getTitle().trim());
        if (req.getDescription() != null) tour.setDescription(req.getDescription());
        if (req.getPricePerPerson() != null) tour.setPricePerPerson(req.getPricePerPerson());
        if (req.getDurationHours() != null) tour.setDurationHours(req.getDurationHours());
        if (req.getMaxSlotsPerSession() != null) tour.setMaxSlotsPerSession(req.getMaxSlotsPerSession());
        if (req.getIncludedMaterials() != null) tour.setIncludedMaterials(req.getIncludedMaterials());
        if (req.getStatus() != null) tour.setStatus(req.getStatus());

        if (req.getImages() != null && !req.getImages().isEmpty()) {
            try {
                tour.setImages(objectMapper.writeValueAsString(req.getImages()));
            } catch (Exception e) {
                tour.setImages(req.getImages().toString());
            }
        }

        HeritageTour saved = tourRepository.save(tour);
        log.info("[TOUR] Cập nhật tour trải nghiệm: id={}", saved.getId());

        return TourResponses.CreateResponse.builder()
                .tourId(saved.getId())
                .title(saved.getTitle())
                .status(saved.getStatus())
                .build();
    }

    @Transactional
    public void deleteTour(UUID tourId) {
        HeritageTour tour = tourRepository.findByIdAndIsDeletedFalse(tourId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tour với ID: " + tourId));

        // Kiểm tra xem có khách đặt trong tương lai không
        Long activeBookings = bookingRepository.countFuturePaidBookings(tourId, LocalDate.now());
        if (activeBookings != null && activeBookings > 0) {
            throw new BusinessException("ACTIVE_BOOKINGS_EXIST", 
                    "Không thể xóa tour! Hiện đang có " + activeBookings + " lượt khách đã đặt chỗ trong tương lai.");
        }

        tour.setDeleted(true);
        tour.setStatus("ARCHIVED");
        tourRepository.save(tour);
        log.info("[TOUR] Xóa mềm tour trải nghiệm: id={}", tourId);
    }

    @Transactional
    public TourBookingDTOs.BookingResponse bookTour(Long customerUserId, TourBookingDTOs.BookingRequest req) {
        HeritageTour tour = tourRepository.findByIdAndIsDeletedFalse(req.getTourId())
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tour với ID: " + req.getTourId()));

        if (!"ACTIVE".equals(tour.getStatus())) {
            throw new BusinessException("TOUR_NOT_ACTIVE", "Khóa học/tour hiện đang tạm dừng đón khách.");
        }

        User customer = customerUserId != null ? userRepository.findById(customerUserId).orElse(null) : null;
        String customerName = req.getCustomerName();
        if ((customerName == null || customerName.isBlank()) && customer != null) {
            customerName = customer.getFullName();
        }
        if (customerName == null || customerName.isBlank()) {
            customerName = "Du khách trải nghiệm";
        }

        // Kiểm tra dung lượng slot: PAID + (PENDING có expires_at > now)
        int occupied = bookingRepository.countBookedSlots(tour.getId(), req.getBookingDate(), req.getSessionTime(), Instant.now());
        int available = tour.getMaxSlotsPerSession() - occupied;

        if (req.getNumberOfGuests() > available) {
            throw new BusinessException("SLOTS_FULL", 
                    "Ca " + ("MORNING".equals(req.getSessionTime()) ? "Sáng" : "Chiều") + " ngày " + 
                    req.getBookingDate() + " chỉ còn " + Math.max(0, available) + " chỗ trống. Bạn yêu cầu " + req.getNumberOfGuests() + " chỗ.");
        }

        BigDecimal totalAmount = tour.getPricePerPerson().multiply(BigDecimal.valueOf(req.getNumberOfGuests()));
        String ticketCode = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        TourBooking booking = TourBooking.builder()
                .tour(tour)
                .customer(customer)
                .customerName(customerName)
                .bookingDate(req.getBookingDate())
                .sessionTime(req.getSessionTime().toUpperCase())
                .numberOfGuests(req.getNumberOfGuests())
                .contactPhone(req.getContactPhone().trim())
                .totalAmount(totalAmount)
                .ticketQrCode(ticketCode)
                .qrTicketUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + ticketCode)
                .paymentStatus("PAID") // Mô phỏng thanh toán VietQR thành công
                .checkinStatus("PENDING")
                .expiresAt(expiresAt)
                .build();

        TourBooking saved = bookingRepository.save(booking);
        log.info("[BOOKING] Đặt tour thành công: id={}, code={}, amount={}", saved.getId(), ticketCode, totalAmount);

        String sessionText = ("MORNING".equalsIgnoreCase(saved.getSessionTime()) ? "Sáng 08:00 - 11:00" : "Chiều 14:00 - 17:00") 
                + " Ngày " + saved.getBookingDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return TourBookingDTOs.BookingResponse.builder()
                .bookingId(saved.getId())
                .totalAmount(saved.getTotalAmount())
                .ticketQrCode(saved.getTicketQrCode())
                .qrTicketUrl(saved.getQrTicketUrl())
                .session(sessionText)
                .paymentStatus(saved.getPaymentStatus())
                .build();
    }

    @Transactional
    public TourBookingDTOs.VerifyTicketResponse verifyTicket(TourBookingDTOs.VerifyTicketRequest req) {
        String code = req.getTicketQrCode() != null ? req.getTicketQrCode().trim().toUpperCase() : "";
        TourBooking booking = bookingRepository.findByTicketQrCode(code)
                .orElseThrow(() -> new BusinessException("TICKET_NOT_FOUND", "Mã vé không tồn tại trên hệ thống!"));

        if ("CHECKED_IN".equals(booking.getCheckinStatus())) {
            String checkinTimeStr = booking.getCheckedInAt() != null 
                    ? LocalDateTime.ofInstant(booking.getCheckedInAt(), VN_ZONE).format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"))
                    : "trước đó";
            return TourBookingDTOs.VerifyTicketResponse.builder()
                    .valid(false)
                    .customerName(booking.getCustomerName())
                    .guestsCount(booking.getNumberOfGuests())
                    .tourName(booking.getTour().getTitle())
                    .message("CẢNH BÁO: Vé đã được sử dụng check-in vào lúc " + checkinTimeStr + "!")
                    .build();
        }

        if ("CANCELLED".equals(booking.getPaymentStatus()) || "REFUNDED".equals(booking.getPaymentStatus())) {
            return TourBookingDTOs.VerifyTicketResponse.builder()
                    .valid(false)
                    .customerName(booking.getCustomerName())
                    .guestsCount(booking.getNumberOfGuests())
                    .tourName(booking.getTour().getTitle())
                    .message("LỖI: Vé này đã bị hủy bỏ hoặc hoàn tiền!")
                    .build();
        }

        booking.setCheckinStatus("CHECKED_IN");
        booking.setCheckedInAt(Instant.now());
        bookingRepository.save(booking);

        log.info("[CHECKIN] Soát vé thành công: code={}, khách={}", code, booking.getCustomerName());

        return TourBookingDTOs.VerifyTicketResponse.builder()
                .valid(true)
                .customerName(booking.getCustomerName())
                .guestsCount(booking.getNumberOfGuests())
                .tourName(booking.getTour().getTitle())
                .message("Soát vé thành công. Chúc quý khách có trải nghiệm ý nghĩa!")
                .build();
    }

    @Transactional
    public TourBookingDTOs.CancelBookingResponse cancelBooking(UUID bookingId, Long customerUserId, String reason) {
        TourBooking booking = bookingRepository.findByIdAndIsDeletedFalse(bookingId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy vé đặt tour với ID: " + bookingId));

        if ("CANCELLED".equals(booking.getPaymentStatus()) || "REFUNDED".equals(booking.getPaymentStatus())) {
            throw new BusinessException("ALREADY_CANCELLED", "Đơn đặt vé này đã được hủy trước đó.");
        }

        // Tính thời gian bắt đầu tour
        LocalTime startTime = "MORNING".equalsIgnoreCase(booking.getSessionTime()) ? LocalTime.of(8, 0) : LocalTime.of(14, 0);
        ZonedDateTime sessionStart = ZonedDateTime.of(booking.getBookingDate(), startTime, VN_ZONE);
        ZonedDateTime now = ZonedDateTime.now(VN_ZONE);

        long hoursUntilStart = Duration.between(now, sessionStart).toHours();
        if (hoursUntilStart < 24) {
            throw new BusinessException("CANCELLATION_TIME_EXPIRED", 
                    "Chỉ được phép hủy vé trước giờ khởi hành tối thiểu 24 giờ (Hiện tại còn " + Math.max(0, hoursUntilStart) + " giờ).");
        }

        booking.setPaymentStatus("REFUNDED");
        booking.setCheckinStatus("EXPIRED");
        booking.setCancelledAt(Instant.now());
        booking.setCancellationReason(reason != null && !reason.isBlank() ? reason.trim() : "Khách hàng chủ động hủy vé trước 24 giờ");
        bookingRepository.save(booking);

        log.info("[CANCEL_BOOKING] Hủy vé tour thành công: id={}, hoàn tiền={}", bookingId, booking.getTotalAmount());

        return TourBookingDTOs.CancelBookingResponse.builder()
                .success(true)
                .bookingId(booking.getId())
                .refundAmount(booking.getTotalAmount())
                .message("Hủy vé thành công. Số tiền " + booking.getTotalAmount() + " VNĐ đã được hoàn trả lại tài khoản của quý khách.")
                .build();
    }

    /**
     * Scheduled Worker: Chạy mỗi 5 phút quét và giải phóng các đơn PENDING giữ chỗ quá 15 phút
     */
    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void releaseExpiredTourBookings() {
        int count = bookingRepository.expirePendingBookings(Instant.now());
        if (count > 0) {
            log.info("[WORKER_TOUR] Đã giải phóng {} đơn đặt vé giữ chỗ quá hạn 15 phút.", count);
        }
    }

    private TourResponses.TourDetailResponse mapToDetailResponse(HeritageTour tour) {
        List<String> images = Collections.emptyList();
        if (tour.getImages() != null && !tour.getImages().isBlank()) {
            try {
                images = objectMapper.readValue(tour.getImages(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                images = List.of(tour.getImages());
            }
        }

        return TourResponses.TourDetailResponse.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .pricePerPerson(tour.getPricePerPerson())
                .durationHours(tour.getDurationHours())
                .maxSlotsPerSession(tour.getMaxSlotsPerSession())
                .includedMaterials(tour.getIncludedMaterials())
                .images(images)
                .status(tour.getStatus())
                .villageId(tour.getCraftVillage() != null ? tour.getCraftVillage().getId() : null)
                .villageName(tour.getCraftVillage() != null ? tour.getCraftVillage().getName() : null)
                .artisanId(tour.getArtisan() != null ? tour.getArtisan().getId() : null)
                .artisanName(tour.getArtisan() != null && tour.getArtisan().getUser() != null ? tour.getArtisan().getUser().getFullName() : null)
                .build();
    }
}
