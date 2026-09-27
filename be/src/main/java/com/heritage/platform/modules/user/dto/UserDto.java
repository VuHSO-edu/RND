package com.heritage.platform.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String unitCode;
    private String unitName;
    private String role;
    private String status;
    private String avatarUrl;
    private Instant createdAt;
}
