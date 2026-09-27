package com.heritage.platform.modules.artisan.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.service.ArtisanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/artisans")
@RequiredArgsConstructor
public class ArtisanController {

    private final ArtisanService artisanService;

    @GetMapping
    public ApiResponse<List<ArtisanProfile>> getArtisans() {
        return ApiResponse.ok(artisanService.getVerifiedArtisans(), "Lấy danh sách nghệ nhân thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<ArtisanProfile> getArtisanById(@PathVariable Long id) {
        return ApiResponse.ok(artisanService.getArtisanById(id), "Lấy thông tin chi tiết nghệ nhân thành công");
    }
}
