package com.heritage.platform.modules.product.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.product.dto.CreateProductRequest;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<PagedResponse<Product>> getProducts(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(productService.getPublishedProducts(categoryId, page, size), "Lấy danh sách sản phẩm thành công");
    }

    @GetMapping("/{slug}")
    public ApiResponse<Product> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.ok(productService.getProductBySlug(slug), "Lấy chi tiết tác phẩm thành công");
    }

    @PostMapping
    public ApiResponse<Product> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ApiResponse.ok(productService.createProduct(request), "Thêm mới tác phẩm thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        return ApiResponse.ok(productService.updateProduct(id, request), "Cập nhật tác phẩm thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.ok("success", "Xóa tác phẩm thành công");
    }
}
