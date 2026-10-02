package com.heritage.platform.modules.artisan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateArtisanRequest {

    @NotBlank(message = "Họ tên nghệ nhân không được để trống")
    private String fullName;

    private String phoneNumber;

    private Long craftVillageId;

    private String title; // Nghệ nhân Ưu tú, Nghệ nhân Dân gian...

    private String bio;

    private Integer yearsOfExperience;

    private String specialtySkills;

    private String philosophy; // "Gốm không chỉ là đất, gốm là hồn người nương vào lửa."

    private String interviewMediaUrl;

    private String workshopAddress;

    private Object certifications;
}
