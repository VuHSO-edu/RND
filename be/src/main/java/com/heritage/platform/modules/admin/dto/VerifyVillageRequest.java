package com.heritage.platform.modules.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyVillageRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private Boolean approved;

    private Long villageAdminUserId;

    private String rejectionReason;
}
