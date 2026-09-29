package com.heritage.platform.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Tên tác phẩm không được để trống")
    private String name;

    private String slug;

    private Long artisanId;

    private Integer categoryId = 1;

    private String description;

    private String materialInfo;

    private String dimensions;

    private Integer weightGram;

    @NotNull(message = "Giá tác phẩm không được để trống")
    private BigDecimal price;

    private Integer stockQuantity = 1;

    private String skuCode;
    private String artisanStory;
    private String creationProcessVideoUrl;
    private String status = "PENDING_APPROVAL";
    private Long villageId;
    private String imageUrl;
    private String model3dUrl;
}
