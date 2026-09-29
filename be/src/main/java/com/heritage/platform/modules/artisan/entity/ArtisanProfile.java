package com.heritage.platform.modules.artisan.entity;

import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

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

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "villageAdmin"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    private CraftVillage craftVillage; // NULL nếu nghệ nhân độc lập

    @Column(name = "is_independent", nullable = false)
    @Builder.Default
    private Boolean isIndependent = false;

    @Column(name = "managed_by_village_admin", nullable = false)
    @Builder.Default
    private Boolean managedByVillageAdmin = false; // Cờ: Quản lý làng quản lý hộ cho nghệ nhân cao tuổi

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_admin_id")
    private User representativeAdmin; // Quản lý làng trực tiếp tạo hộ / đại diện

    @Column(nullable = false, length = 100)
    private String title; // Nghệ nhân Ưu tú, Nghệ nhân Dân gian, Bàn tay vàng

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bio;

    @Column(name = "specialty_skills", columnDefinition = "TEXT")
    private String specialtySkills;

    @Column(name = "certifications", columnDefinition = "TEXT")
    private String certifications; // JSON array lưu bằng khen/danh hiệu

    @Column(name = "activation_token", length = 64)
    private String activationToken; // Mã kích hoạt cấp phát cho nghệ nhân khi tạo hộ

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "workshop_address", nullable = false)
    private String workshopAddress;

    @Column(name = "kyc_document_url")
    private String kycDocumentUrl;

    @Column(name = "verification_status", nullable = false, length = 30)
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, APPROVED, REJECTED, VERIFIED

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "available_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(name = "escrow_balance", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal escrowBalance = BigDecimal.ZERO;
}
