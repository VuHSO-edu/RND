package com.heritage.platform.modules.passport.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.passport.dto.ScanSimulationRequest;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.service.PassportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/passports")
@RequiredArgsConstructor
public class PassportPublicController {

    private final PassportService passportService;

    @GetMapping("/{passportCode}")
    public ApiResponse<HeritagePassport> lookupPassport(@PathVariable String passportCode) {
        HeritagePassport passport = passportService.getPassportByCode(passportCode);
        return ApiResponse.ok(passport, "Tra cứu Hộ chiếu di sản thành công");
    }

    @PostMapping("/scan")
    public ApiResponse<HeritagePassport> recordScan(
            @RequestBody ScanSimulationRequest scanReq,
            HttpServletRequest request
    ) {
        String clientIp = scanReq.getIpAddress();
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isBlank()) {
                clientIp = request.getRemoteAddr();
            }
        }
        String userAgent = request.getHeader("User-Agent");

        HeritagePassport updatedPassport = passportService.processScan(
                scanReq.getPassportCode(),
                clientIp,
                userAgent,
                scanReq.getLatitude(),
                scanReq.getLongitude(),
                scanReq.getCity(),
                scanReq.getCountry()
        );

        return ApiResponse.ok(updatedPassport, "Ghi nhận lượt quét mã xác thực thành công");
    }

    @GetMapping("/{passportCode}/audit-logs")
    public ApiResponse<List<PassportAuditLog>> getAuditLogs(@PathVariable String passportCode) {
        List<PassportAuditLog> logs = passportService.getAuditLogs(passportCode);
        return ApiResponse.ok(logs, "Lấy lịch sử quét mã thành công");
    }
}
