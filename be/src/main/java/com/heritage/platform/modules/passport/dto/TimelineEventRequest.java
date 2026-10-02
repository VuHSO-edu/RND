package com.heritage.platform.modules.passport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventRequest {

    @NotBlank(message = "Loại sự kiện không được để trống")
    private String eventType; // CREATED, INSPECTED, SHIPPED, DELIVERED, ACTIVATED

    private String locationName;

    private Double latitude;

    private Double longitude;

    private String description;

    private String actorRole;
}
