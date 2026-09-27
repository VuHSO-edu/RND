package com.heritage.platform.modules.gis.entity;

import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "power_assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PowerAsset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "asset_type", nullable = false, length = 30)
    @Builder.Default
    private String assetType = "DEVICE"; // UNIT, LINE, DEVICE

    @Column(name = "unit_code", length = 50)
    private String unitCode;

    @Column(name = "unit_name", length = 200)
    private String unitName;

    @Column(name = "voltage_level", length = 50)
    private String voltageLevel;

    private Double latitude;

    private Double longitude;

    @Column(length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String notes;
}
