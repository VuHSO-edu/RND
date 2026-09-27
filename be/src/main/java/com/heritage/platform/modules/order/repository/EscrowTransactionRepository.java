package com.heritage.platform.modules.order.repository;

import com.heritage.platform.modules.order.entity.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {
    Optional<EscrowTransaction> findByOrderId(Long orderId);
    List<EscrowTransaction> findByArtisanIdAndStatus(Long artisanId, String status);
}
