package com.heritage.platform.modules.village.entity;

import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

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

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_admin_id")
    private User villageAdmin; // NULLABLE ban đầu để phá vỡ Circular FK khi đăng ký

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(name = "craft_type", length = 100)
    private String craftType; // Gốm sứ, Lụa tơ tằm, Mây tre đan, Đúc đồng...

    @Column(nullable = false, length = 50)
    private String region; // Bac_Bo, Trung_Bo, Tay_Nguyen, Nam_Bo

    @Column(nullable = false, length = 100)
    private String province;

    @Column(length = 100)
    private String district;

    @Column(name = "address_line")
    private String addressLine;

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

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "coordinates", columnDefinition = "geometry(Point, 4326)")
    private Point coordinates; // Tọa độ PostGIS WGS84

    @Column(name = "coverage_radius_meters", nullable = false)
    @Builder.Default
    private Integer coverageRadiusMeters = 5000; // Bán kính quản lý địa lý của làng (mặc định 5000m)

    @Column(name = "verification_status", nullable = false, length = 30)
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    @PreUpdate
    public void syncGeometryCoordinates() {
        if (latitude != null && longitude != null) {
            GeometryFactory factory = new GeometryFactory(new PrecisionModel(), 4326);
            this.coordinates = factory.createPoint(new Coordinate(longitude, latitude));
        }
    }
}
