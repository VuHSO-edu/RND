package com.heritage.platform.modules.passport.dto;

import com.heritage.platform.modules.passport.entity.PassportTimelineEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassportVerifyResponse {
    private String serialNumber;
    private String passportCode;
    private String status;
    private Boolean isClaimed;
    private String ownerNameMasked;
    private Instant claimedAt;
    private Boolean isRevoked;
    private String revocationReason;
    private Boolean isCounterfeitAlert;
    private String counterfeitWarning;
    private Integer scanCount;

    // Sản phẩm
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImageUrl;
    private String model3dUrl;
    private String materialInfo;
    private String dimensions;
    private Object price;

    // Nghệ nhân
    private Long artisanId;
    private String artisanName;
    private String artisanTitle;
    private String artisanPhilosophy;
    private String artisanInterviewMediaUrl;
    private Integer artisanExperienceYears;

    // Làng nghề
    private Long craftVillageId;
    private String craftVillageName;
    private String province;

    // Lô hàng & Media
    private Long batchId;
    private String batchCode;
    private String batchVideoUrl;

    // Chứng thực Blockchain
    private String verificationHash;
    private String blockchainTxHash;
    private String smartContractAddress;
    private String polygonScanUrl;
    private Instant issuedAt;

    // Lịch sử hành trình
    private List<PassportTimelineEvent> timeline;
}
