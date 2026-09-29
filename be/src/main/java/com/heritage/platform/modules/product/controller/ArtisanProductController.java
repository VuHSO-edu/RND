package com.heritage.platform.modules.product.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.product.dto.ApproveSkuRequest;
import com.heritage.platform.modules.product.dto.CreateProductRequest;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ArtisanProductController {

    private final ProductService productService;

    @PostMapping("/api/v1/products")
    public ApiResponse<Product> createSku(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody CreateProductRequest request
    ) {
        Product product = productService.createProduct(request);
        return ApiResponse.ok(product, "Khai báo mẫu mã SKU thành công");
    }

    @GetMapping("/api/v1/artisans/products")
    public ApiResponse<List<Product>> getMyArtisanProducts(
            @RequestParam(required = false, defaultValue = "1") Long artisanId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        List<Product> list = productService.getProductsByArtisan(artisanId);
        return ApiResponse.ok(list, "Lấy danh mục sản phẩm của nghệ nhân thành công");
    }

    @GetMapping("/api/v1/villages/products/pending")
    public ApiResponse<List<Product>> getPendingVillageProducts(
            @RequestParam(required = false, defaultValue = "1") Long villageId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        List<Product> list = productService.getPendingProductsForVillage(villageId);
        return ApiResponse.ok(list, "Lấy danh sách mẫu sản phẩm chờ duyệt thành công");
    }

    @PutMapping("/api/v1/villages/products/{id}/approve")
    public ApiResponse<Product> reviewSku(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody ApproveSkuRequest request
    ) {
        Product product = productService.reviewProduct(id, userId, Boolean.TRUE.equals(request.getApproved()), request.getRejectionReason());
        return ApiResponse.ok(product, "Đánh giá mẫu mã SKU thành công");
    }
}
