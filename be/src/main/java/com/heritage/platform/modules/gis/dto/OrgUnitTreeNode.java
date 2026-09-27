package com.heritage.platform.modules.gis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgUnitTreeNode {
    private Long id;
    private String code;
    private String name;
    private String label; // "F01 - Tổng Công ty điện lực miền Bắc"
    private String parentCode;
    private Integer level;
    private String type;
    private Double latitude;
    private Double longitude;
    private String address;
    private String status;
    @Builder.Default
    private List<OrgUnitTreeNode> children = new ArrayList<>();
}
