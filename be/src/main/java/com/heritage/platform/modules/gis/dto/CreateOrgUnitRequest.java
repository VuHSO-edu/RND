package com.heritage.platform.modules.gis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateOrgUnitRequest {

    @NotBlank(message = "Mã đơn vị không được để trống")
    @Pattern(regexp = "^[A-Z0-9_]{2,30}$", message = "Mã đơn vị chỉ cho phép chữ hoa không dấu, số và gạch dưới (VD: F01, F01A02)")
    private String code;

    @NotBlank(message = "Tên đơn vị không được để trống")
    private String name;

    private String parentCode;

    private Integer level = 1;

    private String type = "CONG_TY";

    private Double latitude;

    private Double longitude;

    private String address;

    private String phone;
}
