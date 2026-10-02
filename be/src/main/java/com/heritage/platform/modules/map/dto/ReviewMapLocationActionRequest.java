package com.heritage.platform.modules.map.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class ReviewMapLocationActionRequest {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Hành động duyệt (APPROVE hoặc REJECT) không được để trống")
        private String action; // APPROVE, REJECT
        private String rejectionReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String approvalStatus;
        private String rejectionReason;
        private Instant reviewedAt;
    }
}
