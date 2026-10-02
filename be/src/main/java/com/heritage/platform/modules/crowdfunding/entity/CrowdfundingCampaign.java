package com.heritage.platform.modules.crowdfunding.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.village.entity.CraftVillage;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "crowdfunding_campaigns", indexes = {
        @Index(name = "idx_fund_village", columnList = "craft_village_id"),
        @Index(name = "idx_fund_status", columnList = "status"),
        @Index(name = "idx_fund_deadline", columnList = "deadline")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrowdfundingCampaign extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "villageAdmin"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "craft_village_id")
    private CraftVillage craftVillage;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "craftVillage", "user"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_artisan_id")
    private ArtisanProfile targetArtisan;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "story_content", columnDefinition = "TEXT", nullable = false)
    private String storyContent;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "current_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "deadline", nullable = false)
    private LocalDate deadline;

    @Column(name = "donors_count", nullable = false)
    @Builder.Default
    private Integer donorsCount = 0;

    @Column(name = "funding_type", nullable = false, length = 20)
    @Builder.Default
    private String fundingType = "ALL_OR_NOTHING"; // ALL_OR_NOTHING, FLEXIBLE

    @Column(name = "reward_tiers", columnDefinition = "TEXT")
    private String rewardTiers; // JSON array of reward tiers

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // DRAFT, ACTIVE, COMPLETED, FAILED, EXPIRED, CLOSED
}
