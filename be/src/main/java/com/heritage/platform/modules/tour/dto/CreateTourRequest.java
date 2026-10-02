package com.heritage.platform.modules.tour.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTourRequest {

    private Long craftVillageId;

    private Long artisanId;

    @NotBlank(message = "Tiêu đề khóa học/tour không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Giá vé mỗi người không được để trống")
    @DecimalMin(value = "0.0", message = "Giá vé không được nhỏ hơn 0")
    private BigDecimal pricePerPerson;

    @NotNull(message = "Thời lượng khóa học không được để trống")
    private Double durationHours;

    @NotNull(message = "Số lượng chỗ tối đa không được để trống")
    @Min(value = 1, message = "Số chỗ tối đa phải từ 1 người trở lên")
    private Integer maxSlotsPerSession;

    private String includedMaterials;

    private List<String> images;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, PAUSED, ARCHIVED
}
