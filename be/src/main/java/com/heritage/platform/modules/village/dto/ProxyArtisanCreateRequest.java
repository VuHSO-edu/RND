package com.heritage.platform.modules.village.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias("phoneNumber")
    private String phone; // Không bắt buộc với nghệ nhân cao tuổi

    @NotBlank(message = "Danh hiệu hoặc chức danh không được để trống")
    private String title;

    private String bio;

    @JsonAlias("yearsOfExperience")
    private Integer experienceYears;

    private String workshopAddress;

    private String specialtySkills;

    private String philosophy;

    private String interviewMediaUrl;

    @JsonAlias("craftVillageId")
    private Long villageId;

    private Object certifications;
}
