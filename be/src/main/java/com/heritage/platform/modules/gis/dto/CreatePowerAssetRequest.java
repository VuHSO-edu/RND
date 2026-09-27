package com.heritage.platform.modules.gis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreatePowerAssetRequest {

    @NotBlank(message = "Mã thiết bị/tài sản không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{2,50}$", message = "Mã thiết bị chỉ gồm chữ, số, gạch ngang và gạch dưới")
    private String code;

    @NotBlank(message = "Tên thiết bị/tài sản không được để trống")
    private String name;

    @NotBlank(message = "Loại tài sản không được để trống (UNIT, LINE, DEVICE)")
    private String assetType = "DEVICE";

    private String unitCode;

    private String unitName;

    private String voltageLevel;

    private Double latitude;

    private Double longitude;

    private String status = "ACTIVE";

    private String notes;
}
