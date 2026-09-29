package com.heritage.platform.modules.passport.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.passport.dto.BindNfcRequest;
import com.heritage.platform.modules.passport.dto.ScanSimulationRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.service.PassportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PassportPublicController {

    private final PassportService passportService;

    @GetMapping("/api/v1/public/passports/{passportCode}")
    public ApiResponse<HeritagePassport> lookupPassport(@PathVariable String passportCode) {
        HeritagePassport passport = passportService.getPassportByCode(passportCode);
        return ApiResponse.ok(passport, "Tra cứu Hộ chiếu di sản thành công");
    }

    @PostMapping({"/api/v1/public/passports/scan", "/api/v1/public/passports/{passportCode}/scan"})
    public ApiResponse<HeritagePassport> recordScan(
            @PathVariable(required = false) String passportCode,
            @RequestBody ScanSimulationRequest scanReq,
            HttpServletRequest request
    ) {
        String targetCode = (passportCode != null && !passportCode.isBlank()) 
                ? passportCode 
                : scanReq.getPassportCode();

        String clientIp = scanReq.getIpAddress();
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isBlank()) {
                clientIp = request.getRemoteAddr();
            }
        }
        String userAgent = request.getHeader("User-Agent");

        HeritagePassport updatedPassport = passportService.processScan(
                targetCode,
                scanReq,
                clientIp,
                userAgent
        );

        return ApiResponse.ok(updatedPassport, "Ghi nhận lượt quét mã xác thực thành công");
    }

    @PostMapping({"/api/v1/passports/{passportCode}/bind-nfc", "/api/v1/villages/passports/{passportCode}/bind-nfc"})
    public ApiResponse<HeritagePassport> bindNfc(
            @PathVariable String passportCode,
            @Valid @RequestBody BindNfcRequest request
    ) {
        HeritagePassport bound = passportService.bindNfc(passportCode, request.getNfcTagUid());
        return ApiResponse.ok(bound, "Gắn mã chip NFC vào Hộ chiếu di sản thành công");
    }

    @GetMapping("/api/v1/public/passports/{passportCode}/audit-logs")
    public ApiResponse<List<PassportAuditLog>> getAuditLogs(@PathVariable String passportCode) {
        List<PassportAuditLog> logs = passportService.getAuditLogs(passportCode);
        return ApiResponse.ok(logs, "Lấy lịch sử quét mã thành công");
    }
}
