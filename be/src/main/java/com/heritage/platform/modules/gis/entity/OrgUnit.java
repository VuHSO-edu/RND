package com.heritage.platform.modules.gis.entity;

import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "org_units")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgUnit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "parent_code", length = 50)
    private String parentCode;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;

    @Column(length = 50)
    @Builder.Default
    private String type = "CONG_TY";

    private Double latitude;

    private Double longitude;

    @Column(length = 255)
    private String address;

    @Column(length = 30)
    private String phone;

    @Column(length = 30)
    @Builder.Default
    private String status = "ACTIVE";
}
