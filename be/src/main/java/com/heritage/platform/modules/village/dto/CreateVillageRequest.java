package com.heritage.platform.modules.village.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateVillageRequest {

    @NotBlank(message = "Tên làng nghề không được để trống")
    private String name;

    @NotBlank(message = "Mã/Slug làng nghề không được để trống")
    private String slug;

    @NotBlank(message = "Vùng miền không được để trống")
    private String region;

    @NotBlank(message = "Tỉnh thành không được để trống")
    private String province;

    private String historicalSummary;

    private Integer foundingYearEstimate;

    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;

    private String coverImageUrl;
}
