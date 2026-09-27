package com.heritage.platform.modules.village.entity;

import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "craft_villages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CraftVillage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, length = 50)
    private String region; // Bac_Bo, Trung_Bo, Tay_Nguyen, Nam_Bo

    @Column(nullable = false, length = 100)
    private String province;

    @Column(name = "historical_summary", nullable = false, columnDefinition = "TEXT")
    private String historicalSummary;

    @Column(name = "founding_year_estimate")
    private Integer foundingYearEstimate;

    @Column(name = "ancestor_worship_info", columnDefinition = "TEXT")
    private String ancestorWorshipInfo;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
