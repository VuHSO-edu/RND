package com.heritage.platform.modules.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String phone;
    private String unitCode;
    private String unitName;
    private String role;
    private String status;
    private String password;
}
