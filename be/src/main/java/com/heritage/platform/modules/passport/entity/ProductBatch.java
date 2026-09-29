package com.heritage.platform.modules.passport.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "product_batches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatch extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_code", nullable = false, unique = true, length = 64)
    private String batchCode; // Ví dụ: BATCH-2026-BAT-001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "craftVillage", "artisan"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "villageAdmin", "artisans"})
    private CraftVillage craftVillage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "craftVillage"})
    private ArtisanProfile artisan;

    @Column(nullable = false)
    private Integer quantity; // Số lượng xuất xưởng trong lô

    @Column(name = "approval_status", nullable = false, length = 30)
    @Builder.Default
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "onchain_status", nullable = false, length = 30)
    @Builder.Default
    private String onchainStatus = "NOT_COMMITTED"; // NOT_COMMITTED, PENDING_BLOCKCHAIN, CONFIRMED, FAILED

    @Column(name = "merkle_root_hash", length = 128)
    private String merkleRootHash; // SHA-256 Merkle root của toàn bộ hộ chiếu trong lô

    @Column(name = "blockchain_tx_hash", length = 128)
    private String blockchainTxHash; // Polygon transaction hash

    @Column(name = "blockchain_network", length = 64)
    @Builder.Default
    private String blockchainNetwork = "Polygon Amoy Testnet";

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "batch_notes", columnDefinition = "TEXT")
    private String batchNotes;

    @Column(name = "production_date")
    private Instant productionDate;
}
