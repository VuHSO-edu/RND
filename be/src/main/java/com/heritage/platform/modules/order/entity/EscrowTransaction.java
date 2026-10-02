package com.heritage.platform.modules.order.entity;

import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "escrow_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscrowTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id", nullable = false)
    private ArtisanProfile artisan;

    @Column(name = "hold_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal holdAmount;

    @Column(name = "platform_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "net_payout", nullable = false, precision = 15, scale = 2)
    private BigDecimal netPayout;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "HOLDING"; // HOLDING, RELEASED, REFUNDED

    @Column(name = "auto_release_date", nullable = false)
    private Instant autoReleaseDate;

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "disputed_at")
    private Instant disputedAt;

    @Column(name = "evidence_image_url", length = 500)
    private String evidenceImageUrl;
}
