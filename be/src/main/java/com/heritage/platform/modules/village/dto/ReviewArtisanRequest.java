package com.heritage.platform.modules.village.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewArtisanRequest {

    @NotBlank(message = "Trạng thái đánh giá không được để trống")
    private String status; // APPROVED, REJECTED

    private String rejectionReason; // Bắt buộc khi REJECTED
}
