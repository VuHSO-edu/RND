package com.heritage.platform.modules.artisan.dto;

import com.heritage.platform.modules.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtisanPublicProfileResponse {
    private Long id;
    private String fullName;
    private String title;
    private String craftVillageName;
    private String province;
    private String bio;
    private String philosophy;
    private String interviewMediaUrl;
    private Integer experienceYears;
    private String specialtySkills;
    private String workshopAddress;
    private String certifications;
    private List<Product> representativeProducts;
}
