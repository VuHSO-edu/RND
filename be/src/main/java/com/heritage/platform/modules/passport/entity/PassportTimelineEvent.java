package com.heritage.platform.modules.passport.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "passport_timeline_events", indexes = {
        @Index(name = "idx_timeline_serial_number", columnList = "serial_number, event_time")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassportTimelineEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passport_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "product", "batch"})
    private HeritagePassport passport;

    @Column(name = "serial_number", nullable = false, length = 64)
    private String serialNumber;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // CREATED, INSPECTED, SHIPPED, DELIVERED, ACTIVATED

    @Column(name = "location_name", length = 255)
    private String locationName;

    private Double latitude;

    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "actor_role", length = 50)
    private String actorRole; // ARTISAN, VILLAGE_ADMIN, CARRIER, CUSTOMER, SYSTEM

    @Column(name = "event_time", nullable = false)
    @Builder.Default
    private Instant eventTime = Instant.now();
}
