package com.heritage.platform.modules.passport.entity;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true, nullable = false)
    private Product product;

    @Column(name = "passport_code", nullable = false, unique = true, length = 64)
    private String passportCode; // UUID hoặc mã định danh cấp phát

    @Column(name = "nfc_tag_uid", unique = true, length = 128)
    private String nfcTagUid;

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

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, FLAGGED_ANOMALY, REVOKED

    @Column(name = "issued_at", nullable = false)
    @Builder.Default
    private Instant issuedAt = Instant.now();
}
