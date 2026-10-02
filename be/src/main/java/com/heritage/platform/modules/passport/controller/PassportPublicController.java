package com.heritage.platform.modules.passport.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.passport.dto.BlockchainProofResponse;
import com.heritage.platform.modules.passport.dto.ClaimPassportRequest;
import com.heritage.platform.modules.passport.dto.ClaimPassportResponse;
import com.heritage.platform.modules.passport.dto.PassportVerifyResponse;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.entity.PassportTimelineEvent;
import com.heritage.platform.modules.passport.service.PassportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PassportPublicController {

    private final PassportService passportService;

    /**
     * R (Read) - Tra cứu Thông tin Hộ chiếu & Lô hàng (Kiểm tra Chống giả Realtime)
     * Public - Không yêu cầu đăng nhập
     */
    @GetMapping({"/api/v1/passports/{serialNumber}/verify", "/api/v1/public/passports/{serialNumber}/verify"})
    public ApiResponse<PassportVerifyResponse> verifyPassport(
            @PathVariable String serialNumber,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            HttpServletRequest request
    ) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        PassportVerifyResponse res = passportService.verifyPassport(serialNumber, lat, lng, clientIp, userAgent);
        return ApiResponse.ok(res, "Tra cứu và xác thực Hộ chiếu di sản thành công");
    }

    /**
     * Tương thích ngược: Tra cứu Hộ chiếu theo mã công khai
     */
    @GetMapping("/api/v1/public/passports/{passportCode}")
    public ApiResponse<HeritagePassport> lookupPassport(@PathVariable String passportCode) {
        HeritagePassport passport = passportService.getPassportByCode(passportCode);
        return ApiResponse.ok(passport, "Tra cứu Hộ chiếu di sản thành công");
    }

    /**
     * 4. R (Read) - Kiểm tra Bằng chứng On-Chain (Merkle Proof Verification)
     */
    @GetMapping({"/api/v1/passports/{serialNumber}/blockchain-proof", "/api/v1/public/passports/{serialNumber}/blockchain-proof"})
    public ApiResponse<BlockchainProofResponse> getBlockchainProof(@PathVariable String serialNumber) {
        BlockchainProofResponse proof = passportService.getBlockchainProof(serialNumber);
        return ApiResponse.ok(proof, "Lấy bằng chứng xác thực chuỗi khối Merkle Proof thành công");
    }

    /**
     * 5. R (Read) - Xem Toàn bộ Lộ trình / Dòng thời gian đường đi sản phẩm
     */
    @GetMapping({"/api/v1/passports/{serialNumber}/timeline", "/api/v1/public/passports/{serialNumber}/timeline"})
    public ApiResponse<List<PassportTimelineEvent>> getTimeline(@PathVariable String serialNumber) {
        List<PassportTimelineEvent> timeline = passportService.getTimeline(serialNumber);
        return ApiResponse.ok(timeline, "Lấy lịch sử mốc hành trình chuỗi cung ứng thành công");
    }

    /**
     * 6. C (Action) - Kích hoạt Sở hữu Lần đầu (Claim First Scan)
     * Quyền hạn: CUSTOMER (Authenticated)
     */
    @PostMapping("/api/v1/passports/{serialNumber}/claim")
    public ApiResponse<ClaimPassportResponse> claimPassport(
            @PathVariable String serialNumber,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "1") Long customerUserId,
            @RequestHeader(value = "X-User-Name", required = false) String customerName,
            @RequestBody(required = false) ClaimPassportRequest request
    ) {
        ClaimPassportResponse response = passportService.claimPassport(serialNumber, customerUserId, customerName, request);
        return ApiResponse.ok(response, response.getMessage());
    }

    /**
     * Nhật ký quét kiểm toán (Audit Logs)
     */
    @GetMapping("/api/v1/public/passports/{passportCode}/audit-logs")
    public ApiResponse<List<PassportAuditLog>> getAuditLogs(@PathVariable String passportCode) {
        List<PassportAuditLog> logs = passportService.getAuditLogs(passportCode);
        return ApiResponse.ok(logs, "Lấy lịch sử quét mã thành công");
    }
}
