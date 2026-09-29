package com.heritage.platform.modules.map.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposeLocationRequest {

    @NotBlank(message = "Tiêu đề địa điểm không được để trống")
    private String title;

    private String description;

    @NotBlank(message = "Danh mục không được để trống")
    private String category; // VILLAGE_OFFICIAL, WORKSHOP, HISTORICAL_SITE, CHECKIN_POINT

    @NotNull(message = "Vĩ độ không được để trống")
    @DecimalMin(value = "-90.0", message = "Vĩ độ phải từ -90 đến 90")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải từ -90 đến 90")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    @DecimalMin(value = "-180.0", message = "Kinh độ phải từ -180 đến 180")
    @DecimalMax(value = "180.0", message = "Kinh độ phải từ -180 đến 180")
    private Double longitude;

    private String images;

    private Long craftVillageId;
}
