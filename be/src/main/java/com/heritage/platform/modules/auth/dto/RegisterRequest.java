package com.heritage.platform.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String email;
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Builder.Default
    private String role = "ROLE_CUSTOMER";

    // Trường hợp đăng ký Quản lý Làng nghề (VILLAGE_ADMIN)
    private String villageName;
    private String craftType;
    private String region; // Bac_Bo, Trung_Bo, Tay_Nguyen, Nam_Bo
    private String province;
    private String district;
    private String addressLine;
    private String historicalSummary;
    private Double latitude;
    private Double longitude;

    // Trường hợp đăng ký Nghệ nhân (ARTISAN)
    private Long villageId;
    private String title;
    private String bio;
    private Integer experienceYears;
    private String workshopAddress;
    private Boolean isIndependent;
}
