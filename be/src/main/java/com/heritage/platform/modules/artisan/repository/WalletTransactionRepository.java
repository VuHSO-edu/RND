package com.heritage.platform.modules.artisan.repository;

import com.heritage.platform.modules.artisan.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByArtisanIdOrderByCreatedAtDesc(Long artisanId);
}
