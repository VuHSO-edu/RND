package com.heritage.platform.modules.passport.service;

import com.heritage.platform.common.util.HashUtils;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.ProductBatch;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.repository.ProductBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerkleBlockchainService {

    private final ProductBatchRepository batchRepository;
    private final HeritagePassportRepository passportRepository;

    /**
     * Thuật toán xây dựng cây Merkle Tree từ danh sách lá mã băm SHA-256
     */
    public String computeMerkleRoot(List<String> leafHashes) {
        if (leafHashes == null || leafHashes.isEmpty()) {
            return HashUtils.sha256("EMPTY_TREE");
        }
        if (leafHashes.size() == 1) {
            return leafHashes.get(0);
        }

        List<String> currentLevel = new ArrayList<>(leafHashes);
        while (currentLevel.size() > 1) {
            List<String> nextLevel = new ArrayList<>();
            for (int i = 0; i < currentLevel.size(); i += 2) {
                String left = currentLevel.get(i);
                String right = (i + 1 < currentLevel.size()) ? currentLevel.get(i + 1) : left; // Nếu lẻ thì nhân đôi lá cuối
                String parentHash = HashUtils.sha256(left + right);
                nextLevel.add(parentHash);
            }
            currentLevel = nextLevel;
        }

        return currentLevel.get(0);
    }

    /**
     * Tạo Merkle Proof (các nhánh băm trung gian) cho một tem kiểm tra với Merkle Root
     */
    public List<String> generateMerkleProof(List<String> leafHashes, String targetHash) {
        List<String> proof = new ArrayList<>();
        if (leafHashes == null || leafHashes.isEmpty() || !leafHashes.contains(targetHash)) {
            return proof;
        }

        List<String> currentLevel = new ArrayList<>(leafHashes);
        int index = currentLevel.indexOf(targetHash);

        while (currentLevel.size() > 1) {
            List<String> nextLevel = new ArrayList<>();
            for (int i = 0; i < currentLevel.size(); i += 2) {
                String left = currentLevel.get(i);
                String right = (i + 1 < currentLevel.size()) ? currentLevel.get(i + 1) : left;

                if (i == index) {
                    proof.add(right);
                } else if (i + 1 == index) {
                    proof.add(left);
                }

                String parentHash = HashUtils.sha256(left + right);
                nextLevel.add(parentHash);
            }
            index = index / 2;
            currentLevel = nextLevel;
        }
        return proof;
    }

    /**
     * Tác vụ bất đồng bộ @Async gom hash Merkle Root và cam kết giao dịch on-chain
     * Phản hồi ngay cho Village Admin trên Mobile không để trình duyệt chờ đợi
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processBatchOnchainAsync(Long batchId) {
        log.info("[BLOCKCHAIN_ASYNC_START] Bắt đầu tác vụ gom Merkle Root & ghi sổ Polygon cho Batch ID: {}", batchId);

        try {
            // Cho phép parent transaction commit hoàn toàn
            Thread.sleep(150);

            ProductBatch batch = batchRepository.findById(batchId).orElse(null);
            if (batch == null) {
                log.error("[BLOCKCHAIN_ASYNC_ERR] Không tìm thấy Batch ID: {}", batchId);
                return;
            }

            batch.setOnchainStatus("PENDING_BLOCKCHAIN");
            batchRepository.saveAndFlush(batch);

            List<HeritagePassport> passports = passportRepository.findByBatchId(batchId);
            if (passports.isEmpty()) {
                log.warn("[BLOCKCHAIN_ASYNC_WARN] Lô hàng {} không có hộ chiếu con", batch.getBatchCode());
                batch.setOnchainStatus("CONFIRMED");
                batchRepository.saveAndFlush(batch);
                return;
            }

            List<String> leafHashes = passports.stream()
                    .map(HeritagePassport::getVerificationHash)
                    .toList();

            String merkleRoot = computeMerkleRoot(leafHashes);

            // Mô phỏng xác nhận trên mạng Polygon Amoy
            String txHash = "0x" + UUID.randomUUID().toString().replace("-", "") + System.currentTimeMillis();
            long blockNumber = 12849000L + (System.currentTimeMillis() % 10000);

            batch.setMerkleRootHash(merkleRoot);
            batch.setBlockchainTxHash(txHash);
            batch.setBlockNumber(blockNumber);
            batch.setBlockchainNetwork("Polygon Amoy Testnet");
            batch.setOnchainStatus("CONFIRMED");
            batchRepository.saveAndFlush(batch);

            // Kích hoạt toàn bộ Hộ chiếu di sản trong lô
            for (HeritagePassport p : passports) {
                p.setStatus("ACTIVE");
                p.setBlockchainTxHash(txHash);
            }
            passportRepository.saveAllAndFlush(passports);

            log.info("[BLOCKCHAIN_ASYNC_SUCCESS] Lô hàng {} đã ghi nhận On-Chain thành công! MerkleRoot={}, TxHash={}, Block={}",
                    batch.getBatchCode(), merkleRoot, txHash, blockNumber);

        } catch (Exception e) {
            log.error("[BLOCKCHAIN_ASYNC_FAILED] Lỗi khi xử lý On-chain cho Batch ID {}: {}", batchId, e.getMessage(), e);
            ProductBatch batch = batchRepository.findById(batchId).orElse(null);
            if (batch != null) {
                batch.setOnchainStatus("FAILED");
                batchRepository.saveAndFlush(batch);
            }
        }
    }
}
