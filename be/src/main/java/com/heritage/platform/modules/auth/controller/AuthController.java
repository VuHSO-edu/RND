package com.heritage.platform.modules.auth.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.auth.dto.AuthResponse;
import com.heritage.platform.modules.auth.dto.LoginRequest;
import com.heritage.platform.modules.auth.dto.RegisterRequest;
import com.heritage.platform.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.ok(response, "Đăng ký tài khoản thành công");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.ok(response, "Đăng nhập thành công");
    }
}
