package com.heritage.platform.modules.map.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

@Entity
@Table(name = "map_locations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapLocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id")
    private User submittedBy;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "villageAdmin"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    private CraftVillage craftVillage;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category; // VILLAGE_OFFICIAL, WORKSHOP, HISTORICAL_SITE, CHECKIN_POINT

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @JsonIgnore
    @Column(name = "coordinates", columnDefinition = "geometry(Point, 4326)")
    private Point coordinates;

    @Column(columnDefinition = "TEXT")
    private String images; // JSON array URL

    @Column(name = "approval_status", nullable = false, length = 30)
    @Builder.Default
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "review_scope", nullable = false, length = 30)
    @Builder.Default
    private String reviewScope = "VILLAGE"; // VILLAGE, SUPER_ADMIN

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @PrePersist
    @PreUpdate
    public void syncCoordinates() {
        if (latitude != null && longitude != null) {
            GeometryFactory factory = new GeometryFactory(new PrecisionModel(), 4326);
            this.coordinates = factory.createPoint(new Coordinate(longitude, latitude));
        }
    }
}
