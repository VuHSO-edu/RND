package com.heritage.platform.modules.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EscrowScheduler {

    private final EscrowService escrowService;

    /**
     * Tự động quét và giải ngân các giao dịch ký quỹ đã hết thời hạn 7 ngày bảo hộ (01:00 AM hàng ngày)
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void scheduleAutoRelease() {
        log.info("[ESCROW_CRON_WORKER] Bắt đầu quét các giao dịch ký quỹ đủ điều kiện giải ngân tự động...");
        int count = escrowService.autoReleaseEligibleEscrows();
        log.info("[ESCROW_CRON_WORKER] Hoàn tất quét giải ngân! Tổng số giao dịch được giải phóng: {}", count);
    }
}
