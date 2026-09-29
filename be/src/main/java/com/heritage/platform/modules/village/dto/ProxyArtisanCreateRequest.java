package com.heritage.platform.modules.village.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProxyArtisanCreateRequest {

    @NotBlank(message = "Họ tên nghệ nhân không được để trống")
    private String fullName;

    private String phone; // Không bắt buộc với nghệ nhân cao tuổi

    @NotBlank(message = "Danh hiệu hoặc chức danh không được để trống")
    private String title;

    private String bio;

    private Integer experienceYears;

    private String workshopAddress;

    private String specialtySkills;

    private Long villageId;
}
