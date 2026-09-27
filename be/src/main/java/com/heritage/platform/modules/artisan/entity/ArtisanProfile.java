package com.heritage.platform.modules.artisan.entity;

import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "artisan_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtisanProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    private CraftVillage craftVillage;

    @Column(nullable = false, length = 100)
    private String title; // Nghệ nhân Ưu tú, Nghệ nhân Dân gian, Bàn tay vàng

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "workshop_address", nullable = false)
    private String workshopAddress;

    @Column(name = "kyc_document_url")
    private String kycDocumentUrl;

    @Column(name = "verification_status", nullable = false, length = 30)
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "available_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(name = "escrow_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal escrowBalance = BigDecimal.ZERO;
}
