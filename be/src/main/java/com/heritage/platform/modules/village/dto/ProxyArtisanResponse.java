package com.heritage.platform.modules.village.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProxyArtisanResponse {

    private Long artisanId;
    private Long userId;
    private String fullName;
    private String phone;
    private String title;
    private String activationCode;
    private String workshopAddress;
    private Boolean managedByVillageAdmin;
    private String status;
    private String villageName;
}
