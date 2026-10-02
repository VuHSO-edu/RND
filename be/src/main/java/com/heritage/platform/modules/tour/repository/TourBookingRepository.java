package com.heritage.platform.modules.tour.repository;

import com.heritage.platform.modules.tour.entity.TourBooking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TourBookingRepository extends JpaRepository<TourBooking, UUID> {

    @EntityGraph(attributePaths = {"tour", "customer"})
    Optional<TourBooking> findByTicketQrCode(String ticketQrCode);

    @EntityGraph(attributePaths = {"tour", "customer"})
    Optional<TourBooking> findByIdAndIsDeletedFalse(UUID id);

    @EntityGraph(attributePaths = {"tour"})
    List<TourBooking> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(Long customerId);

    // Đếm số lượng chỗ đã chiếm: Bao gồm các đơn PAID hoặc đơn PENDING chưa hết hạn 15 phút
    @Query("SELECT COALESCE(SUM(b.numberOfGuests), 0) FROM TourBooking b WHERE b.tour.id = :tourId " +
           "AND b.bookingDate = :bookingDate AND b.sessionTime = :sessionTime " +
           "AND b.isDeleted = false " +
           "AND (b.paymentStatus = 'PAID' OR (b.paymentStatus = 'PENDING' AND b.expiresAt > :now))")
    Integer countBookedSlots(
            @Param("tourId") UUID tourId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("sessionTime") String sessionTime,
            @Param("now") Instant now
    );

    // Kiểm tra xem tour có booking tương lai chưa (để chặn delete tour)
    @Query("SELECT COUNT(b) FROM TourBooking b WHERE b.tour.id = :tourId " +
           "AND b.bookingDate >= :today AND b.paymentStatus = 'PAID' AND b.isDeleted = false")
    Long countFuturePaidBookings(@Param("tourId") UUID tourId, @Param("today") LocalDate today);

    // Scheduled Worker: Tự động thu hồi các đơn PENDING đã quá hạn
    @Modifying
    @Query("UPDATE TourBooking b SET b.paymentStatus = 'CANCELLED' " +
           "WHERE b.paymentStatus = 'PENDING' AND b.expiresAt < :now")
    int expirePendingBookings(@Param("now") Instant now);
}
