package com.heritage.platform.modules.crowdfunding.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "crowdfunding_donations", indexes = {
        @Index(name = "idx_donation_campaign", columnList = "campaign_id"),
        @Index(name = "idx_donation_status", columnList = "payment_status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrowdfundingDonation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private CrowdfundingCampaign campaign;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_user_id")
    private User donorUser;

    @Column(name = "donor_name", nullable = false, length = 150)
    private String donorName;

    @Column(name = "donor_email", length = 150)
    private String donorEmail;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private Boolean isAnonymous = false;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "tier_id", length = 50)
    private String tierId;

    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private String paymentStatus = "PENDING"; // PENDING, PAID, REFUNDED, FAILED

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "donated_at")
    private Instant donatedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;
}
