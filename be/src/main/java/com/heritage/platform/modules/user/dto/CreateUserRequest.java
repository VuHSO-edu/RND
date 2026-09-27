package com.heritage.platform.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9_]{3,30}$", message = "Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới (3-30 ký tự)")
    private String username;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    private String password;

    private String unitCode;

    private String unitName;

    private String role = "ROLE_USER";
}
