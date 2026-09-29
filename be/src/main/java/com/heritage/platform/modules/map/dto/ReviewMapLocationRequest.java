package com.heritage.platform.modules.map.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewMapLocationRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private Boolean approved;

    private String rejectionReason;
}
