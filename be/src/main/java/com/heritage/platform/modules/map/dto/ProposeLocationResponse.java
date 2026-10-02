package com.heritage.platform.modules.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposeLocationResponse {
    private String id;
    private String status;
    private String reviewScope;
    private String assignedVillageId;
    private String message;
}
