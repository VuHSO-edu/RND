package com.heritage.platform.modules.passport.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "heritage_passports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeritagePassport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "craftVillage", "artisan"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "product", "craftVillage", "artisan"})
    private ProductBatch batch;

    @Column(name = "passport_code", nullable = false, unique = true, length = 64)
    private String passportCode; // UUID hoặc mã định danh cấp phát

    @Column(name = "serial_number", length = 64)
    private String serialNumber; // Ví dụ: HP-BAT-2026-000001

    @Column(name = "nfc_tag_uid", unique = true, length = 128)
    private String nfcTagUid;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "crafting_video_url")
    private String craftingVideoUrl;

    @Column(name = "artisan_story_quote", columnDefinition = "TEXT")
    private String artisanStoryQuote;

    @Column(name = "blockchain_tx_hash", length = 128)
    private String blockchainTxHash;

    @Column(name = "blockchain_token_id", length = 64)
    private String blockchainTokenId;

    @Column(name = "smart_contract_address", length = 64)
    private String smartContractAddress;

    @Column(name = "verification_hash", nullable = false, length = 256)
    private String verificationHash; // SHA-256 đối chiếu tính bất biến

    @Column(name = "scan_count", nullable = false)
    @Builder.Default
    private Integer scanCount = 0;

    @Column(name = "is_claimed", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isClaimed = false;

    @Column(name = "claimed_at")
    private Instant claimedAt;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "activation_secret_code", length = 32)
    private String activationSecretCode;

    @Column(name = "is_revoked", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isRevoked = false;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    @Column(name = "is_counterfeit_alert", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isCounterfeitAlert = false;

    @Column(name = "certificate_download_url")
    private String certificateDownloadUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // PENDING_APPROVAL, ACTIVE, FLAGGED_ANOMALY, BLOCKED_COUNTERFEIT, REVOKED

    @Column(name = "issued_at", nullable = false)
    @Builder.Default
    private Instant issuedAt = Instant.now();
}
