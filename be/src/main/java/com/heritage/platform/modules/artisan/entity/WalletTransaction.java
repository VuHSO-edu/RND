package com.heritage.platform.modules.artisan.entity;

import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "artisan_wallet_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id", nullable = false)
    private ArtisanProfile artisan;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType; // WITHDRAW, ESCROW_RELEASE, PLATFORM_FEE

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "COMPLETED"; // PENDING, COMPLETED, REJECTED

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_account_name", length = 100)
    private String bankAccountName;

    @Column(name = "tx_reference", length = 100)
    private String txReference;

    @Column(columnDefinition = "TEXT")
    private String note;
}
