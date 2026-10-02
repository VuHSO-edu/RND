package com.heritage.platform.modules.artisan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateArtisanProfileRequest {
    private String title;
    private String bio;
    private String specialtySkills;
    private String philosophy;
    private String interviewMediaUrl;
    private String workshopAddress;
    private Integer yearsOfExperience;
}
