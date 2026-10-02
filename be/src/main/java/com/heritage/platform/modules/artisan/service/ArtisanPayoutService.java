package com.heritage.platform.modules.artisan.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.dto.WalletResponse;
import com.heritage.platform.modules.artisan.dto.WithdrawRequest;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.entity.WalletTransaction;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.artisan.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtisanPayoutService {

    private final ArtisanProfileRepository artisanRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional(readOnly = true)
    public WalletResponse getWalletInfo(Long artisanId) {
        ArtisanProfile artisan = getArtisanOrFallback(artisanId);
        List<WalletTransaction> txs = walletTransactionRepository.findByArtisanIdOrderByCreatedAtDesc(artisan.getId());

        BigDecimal totalWithdrawn = txs.stream()
                .filter(t -> "WITHDRAW".equalsIgnoreCase(t.getTransactionType()) && "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WalletResponse.builder()
                .artisanId(artisan.getId())
                .artisanName(artisan.getUser() != null ? artisan.getUser().getFullName() : artisan.getTitle())
                .availableBalance(artisan.getAvailableBalance() != null ? artisan.getAvailableBalance() : BigDecimal.ZERO)
                .escrowBalance(artisan.getEscrowBalance() != null ? artisan.getEscrowBalance() : BigDecimal.ZERO)
                .totalWithdrawn(totalWithdrawn)
                .transactions(txs)
                .build();
    }

    @Transactional
    public WalletTransaction requestWithdraw(Long artisanId, WithdrawRequest req) {
        ArtisanProfile artisan = getArtisanOrFallback(artisanId);

        BigDecimal withdrawAmount = req.getAmount();
        if (withdrawAmount == null || withdrawAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("INVALID_AMOUNT", "Số tiền rút phải lớn hơn 0");
        }

        BigDecimal currentAvailable = artisan.getAvailableBalance() != null ? artisan.getAvailableBalance() : BigDecimal.ZERO;
        if (currentAvailable.compareTo(withdrawAmount) < 0) {
            throw new BusinessException("INSUFFICIENT_BALANCE", 
                    "Số dư khả dụng (" + currentAvailable + " VNĐ) không đủ để rút " + withdrawAmount + " VNĐ");
        }

        // Trừ số dư khả dụng an toàn
        artisan.setAvailableBalance(currentAvailable.subtract(withdrawAmount));
        artisanRepository.save(artisan);

        String txRef = "WD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        WalletTransaction tx = WalletTransaction.builder()
                .artisan(artisan)
                .amount(withdrawAmount)
                .transactionType("WITHDRAW")
                .status("COMPLETED")
                .bankName(req.getBankName().trim())
                .bankAccountNumber(req.getBankAccountNumber().trim())
                .bankAccountName(req.getBankAccountName().trim())
                .txReference(txRef)
                .note(req.getNote() != null ? req.getNote().trim() : "Rút tiền về tài khoản ngân hàng thụ hưởng")
                .build();

        WalletTransaction savedTx = walletTransactionRepository.save(tx);
        log.info("[ARTISAN_WITHDRAW] Nghệ nhân #{} rút thành công: Số tiền={}, Mã GD={}, Ngân hàng={}",
                artisan.getId(), withdrawAmount, txRef, req.getBankName());

        return savedTx;
    }

    private ArtisanProfile getArtisanOrFallback(Long artisanId) {
        if (artisanId != null) {
            return artisanRepository.findById(artisanId)
                    .orElseGet(() -> artisanRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân")));
        }
        return artisanRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân"));
    }
}
