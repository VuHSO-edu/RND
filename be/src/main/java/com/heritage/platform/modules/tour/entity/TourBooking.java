package com.heritage.platform.modules.tour.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tour_bookings", indexes = {
        @Index(name = "idx_booking_tour_date", columnList = "tour_id, booking_date, session_time"),
        @Index(name = "idx_booking_ticket_qr", columnList = "ticket_qr_code", unique = true),
        @Index(name = "idx_booking_payment_status", columnList = "payment_status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourBooking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private HeritageTour tour;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "session_time", nullable = false, length = 20)
    private String sessionTime; // MORNING, AFTERNOON

    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @Column(name = "contact_phone", nullable = false, length = 30)
    private String contactPhone;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "ticket_qr_code", nullable = false, unique = true, length = 50)
    private String ticketQrCode; // TKT-{UUID-8-Chars}

    @Column(name = "qr_ticket_url")
    private String qrTicketUrl;

    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private String paymentStatus = "PENDING"; // PENDING, PAID, CANCELLED, REFUNDED

    @Column(name = "checkin_status", nullable = false, length = 30)
    @Builder.Default
    private String checkinStatus = "PENDING"; // PENDING, CHECKED_IN, EXPIRED

    @Column(name = "expires_at")
    private Instant expiresAt; // 15-minute slot lock timestamp

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
}
