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
import java.util.List;

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

        // Tính phí sàn an toàn với BigDecimal (5%)
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
        if (artisan != null) {
            artisan.setEscrowBalance(artisan.getEscrowBalance().add(netPayout));
            artisanRepository.save(artisan);
        }

        log.info("[ESCROW_HOLD_CREATED] OrderId={}, ArtisanId={}, HoldAmount={}, NetPayout={}",
                order.getId(), artisan != null ? artisan.getId() : null, totalAmount, netPayout);

        return escrowRepository.save(escrow);
    }

    @Transactional
    public void releaseEscrowToArtisan(Long orderId) {
        EscrowTransaction escrow = escrowRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("ESCROW_NOT_FOUND", "Không tìm thấy giao dịch ký quỹ của đơn hàng"));

        if (!"HOLDING".equals(escrow.getStatus())) {
            throw new BusinessException("ESCROW_ALREADY_PROCESSED", "Giao dịch ký quỹ không ở trạng thái HOLDING (Trạng thái hiện tại: " + escrow.getStatus() + ")");
        }

        ArtisanProfile artisan = escrow.getArtisan();
        if (artisan != null) {
            // Chuyển tiền từ escrow_balance sang available_balance an toàn
            BigDecimal netPayout = escrow.getNetPayout();
            artisan.setEscrowBalance(artisan.getEscrowBalance().subtract(netPayout));
            artisan.setAvailableBalance(artisan.getAvailableBalance().add(netPayout));
            artisanRepository.save(artisan);
        }

        escrow.setStatus("RELEASED");
        escrow.setReleasedAt(Instant.now());
        escrowRepository.save(escrow);

        log.info("[ESCROW_RELEASED_SUCCESS] OrderId={}, ArtisanId={}, Amount={}",
                orderId, artisan != null ? artisan.getId() : null, escrow.getNetPayout());
    }

    @Transactional
    public void disputeEscrow(Long orderId, String disputeReason, String evidenceImageUrl) {
        EscrowTransaction escrow = escrowRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("ESCROW_NOT_FOUND", "Không tìm thấy giao dịch ký quỹ của đơn hàng"));

        if (!"HOLDING".equals(escrow.getStatus())) {
            throw new BusinessException("CANNOT_DISPUTE_ESCROW", "Chỉ có thể khiếu nại đơn hàng đang trong thời hạn bảo hiểm ký quỹ (HOLDING).");
        }

        escrow.setStatus("DISPUTED");
        escrow.setDisputeReason(disputeReason != null ? disputeReason.trim() : "Khách hàng mở khiếu nại chất lượng tác phẩm di sản");
        escrow.setDisputedAt(Instant.now());
        escrow.setEvidenceImageUrl(evidenceImageUrl);
        escrowRepository.save(escrow);

        log.warn("[ESCROW_DISPUTED] Đơn hàng OrderId={} đã bị khiếu nại! Tạm dừng bộ đếm thời gian tự động giải ngân. Lý do: {}",
                orderId, disputeReason);
    }

    @Transactional
    public void refundEscrowToCustomer(Long orderId, String refundReason) {
        EscrowTransaction escrow = escrowRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("ESCROW_NOT_FOUND", "Không tìm thấy giao dịch ký quỹ của đơn hàng"));

        if ("RELEASED".equals(escrow.getStatus())) {
            throw new BusinessException("ALREADY_RELEASED", "Không thể hoàn tiền do khoản tiền đã được giải ngân cho nghệ nhân.");
        }

        ArtisanProfile artisan = escrow.getArtisan();
        if (artisan != null) {
            BigDecimal netPayout = escrow.getNetPayout();
            artisan.setEscrowBalance(artisan.getEscrowBalance().subtract(netPayout));
            artisanRepository.save(artisan);
        }

        escrow.setStatus("REFUNDED");
        escrow.setDisputeReason((escrow.getDisputeReason() != null ? escrow.getDisputeReason() + " | " : "") + "Hoàn tiền: " + refundReason);
        escrowRepository.save(escrow);

        log.info("[ESCROW_REFUNDED] Đơn hàng OrderId={} đã hoàn tiền về cho khách hàng thành công.", orderId);
    }

    @Transactional(readOnly = true)
    public EscrowTransaction getEscrowByOrderId(Long orderId) {
        return escrowRepository.findByOrderId(orderId).orElse(null);
    }

    @Transactional
    public int autoReleaseEligibleEscrows() {
        List<EscrowTransaction> eligible = escrowRepository.findHoldingEligibleForRelease(Instant.now());
        int releasedCount = 0;

        for (EscrowTransaction escrow : eligible) {
            try {
                ArtisanProfile artisan = escrow.getArtisan();
                if (artisan != null) {
                    BigDecimal netPayout = escrow.getNetPayout();
                    artisan.setEscrowBalance(artisan.getEscrowBalance().subtract(netPayout));
                    artisan.setAvailableBalance(artisan.getAvailableBalance().add(netPayout));
                    artisanRepository.save(artisan);
                }

                escrow.setStatus("RELEASED");
                escrow.setReleasedAt(Instant.now());
                escrowRepository.save(escrow);
                releasedCount++;

                log.info("[ESCROW_SCHEDULER_AUTO_RELEASE] Tự động giải ngân sau {} ngày thành công: OrderId={}, NetPayout={}",
                        autoReleaseDays, escrow.getOrder().getId(), escrow.getNetPayout());
            } catch (Exception e) {
                log.error("[ESCROW_AUTO_RELEASE_ERROR] Lỗi khi giải ngân tự động OrderId={}: {}",
                        escrow.getOrder().getId(), e.getMessage(), e);
            }
        }
        return releasedCount;
    }
}
