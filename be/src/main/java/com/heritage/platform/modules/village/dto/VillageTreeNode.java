package com.heritage.platform.modules.village.dto;

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
public class VillageTreeNode {
    private String id;
    private String code;
    private String name;
    private String label;
    private String type; // "REGION", "PROVINCE", "VILLAGE"
    private Double latitude;
    private Double longitude;
    private String province;
    private String region;
    @Builder.Default
    private List<VillageTreeNode> children = new ArrayList<>();
}
