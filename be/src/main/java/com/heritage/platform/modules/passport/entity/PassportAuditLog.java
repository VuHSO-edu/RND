package com.heritage.platform.modules.passport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "passport_audit_logs", indexes = {
        @Index(name = "idx_passport_scanned_at", columnList = "passport_id, scanned_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassportAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passport_id", nullable = false)
    private HeritagePassport passport;

    @CreationTimestamp
    @Column(name = "scanned_at", updatable = false, nullable = false)
    private Instant scannedAt;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    private Double latitude;

    private Double longitude;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(name = "is_anomaly", nullable = false)
    @Builder.Default
    private Boolean isAnomaly = false;
}
