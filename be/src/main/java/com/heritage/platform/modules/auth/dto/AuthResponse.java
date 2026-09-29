package com.heritage.platform.modules.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";

    private Long userId;
    private String email;
    private String phone;
    private String fullName;
    private String role;
    private String status;
    private String avatarUrl;

    // Thông tin bổ sung
    private Long villageId;
    private String villageName;
    private Long artisanId;
    private String artisanTitle;
    private String verificationStatus;
}
