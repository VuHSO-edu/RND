package com.heritage.platform.modules.passport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainProofResponse {
    private String serialNumber;
    private String verificationHash;
    private String merkleRoot;
    private List<String> merkleProof;
    private String blockchainTxHash;
    private Long blockNumber;
    private String network;
    private String polygonScanUrl;
    private Boolean verified;
}
