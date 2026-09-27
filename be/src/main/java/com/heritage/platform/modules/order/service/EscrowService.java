package com.heritage.platform.modules.order.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.order.entity.EscrowTransaction;
import com.heritage.platform.modules.order.entity.Order;
import com.heritage.platform.modules.order.repository.EscrowTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowTransactionRepository escrowRepository;
    private final ArtisanProfileRepository artisanRepository;

    @Value("${heritage.escrow.auto-release-days:7}")
    private int autoReleaseDays;

    @Value("${heritage.escrow.platform-fee-percent:0.05}")
    private double platformFeePercent;

    @Transactional
    public EscrowTransaction createEscrowHold(Order order, ArtisanProfile artisan, BigDecimal totalAmount) {
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("INVALID_ESCROW_AMOUNT", "Số tiền ký quỹ phải lớn hơn 0");
        }

        // Tính phí sàn an toàn với BigDecimal
        BigDecimal feeRate = BigDecimal.valueOf(platformFeePercent);
        BigDecimal platformFee = totalAmount.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netPayout = totalAmount.subtract(platformFee);

        Instant autoReleaseDate = Instant.now().plus(autoReleaseDays, ChronoUnit.DAYS);

        EscrowTransaction escrow = EscrowTransaction.builder()
                .order(order)
                .artisan(artisan)
                .holdAmount(totalAmount)
                .platformFee(platformFee)
                .netPayout(netPayout)
                .status("HOLDING")
                .autoReleaseDate(autoReleaseDate)
                .build();

        // Cập nhật số dư ký quỹ của nghệ nhân
        artisan.setEscrowBalance(artisan.getEscrowBalance().add(netPayout));
        artisanRepository.save(artisan);

        log.info("[ESCROW_HOLD_CREATED] OrderId={}, ArtisanId={}, HoldAmount={}, NetPayout={}",
                order.getId(), artisan.getId(), totalAmount, netPayout);

        return escrowRepository.save(escrow);
    }

    @Transactional
    public void releaseEscrowToArtisan(Long orderId) {
        EscrowTransaction escrow = escrowRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("ESCROW_NOT_FOUND", "Không tìm thấy giao dịch ký quỹ của đơn hàng"));

        if (!"HOLDING".equals(escrow.getStatus())) {
            throw new BusinessException("ESCROW_ALREADY_PROCESSED", "Giao dịch ký quỹ đã được xử lý trước đó");
        }

        ArtisanProfile artisan = escrow.getArtisan();

        // Chuyển tiền từ escrow_balance sang available_balance an toàn
        BigDecimal netPayout = escrow.getNetPayout();
        artisan.setEscrowBalance(artisan.getEscrowBalance().subtract(netPayout));
        artisan.setAvailableBalance(artisan.getAvailableBalance().add(netPayout));
        artisanRepository.save(artisan);

        escrow.setStatus("RELEASED");
        escrow.setReleasedAt(Instant.now());
        escrowRepository.save(escrow);

        log.info("[ESCROW_RELEASED_SUCCESS] OrderId={}, ArtisanId={}, Amount={}",
                orderId, artisan.getId(), netPayout);
    }
}
