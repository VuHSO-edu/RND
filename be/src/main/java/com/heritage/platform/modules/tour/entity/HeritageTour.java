package com.heritage.platform.modules.tour.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "heritage_tours", indexes = {
        @Index(name = "idx_tour_village", columnList = "craft_village_id"),
        @Index(name = "idx_tour_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeritageTour extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "villageAdmin"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    private CraftVillage craftVillage;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "craftVillage", "user"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id")
    private ArtisanProfile artisan;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_per_person", nullable = false, precision = 15, scale = 2)
    private BigDecimal pricePerPerson;

    @Column(name = "duration_hours", nullable = false)
    private Double durationHours;

    @Column(name = "max_slots_per_session", nullable = false)
    private Integer maxSlotsPerSession;

    @Column(name = "included_materials", columnDefinition = "TEXT")
    private String includedMaterials;

    @Column(columnDefinition = "TEXT")
    private String images; // JSON Array of image URLs

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, PAUSED, ARCHIVED
}
