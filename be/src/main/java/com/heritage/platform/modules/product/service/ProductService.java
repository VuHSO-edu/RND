package com.heritage.platform.modules.product.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.product.dto.CreateProductRequest;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.heritage.platform.modules.village.repository.CraftVillageRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final CraftVillageRepository craftVillageRepository;

    @Transactional(readOnly = true)
    public PagedResponse<Product> getPublishedProducts(Integer categoryId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage;

        if (categoryId != null && categoryId > 0) {
            productPage = productRepository.findByCategoryIdAndStatusAndIsDeletedFalse(categoryId, "PUBLISHED", pageRequest);
        } else {
            productPage = productRepository.findByStatusAndIsDeletedFalse("PUBLISHED", pageRequest);
        }

        return PagedResponse.<Product>builder()
                .content(productPage.getContent())
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public Product getProductBySlug(String slug) {
        return productRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Không tìm thấy tác phẩm di sản"));
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Không tìm thấy tác phẩm"));
    }

    @Transactional
    public Product createProduct(CreateProductRequest request) {
        String cleanSlug = request.getSlug() != null ? request.getSlug().trim().toLowerCase() : "sp-" + System.currentTimeMillis();
        if (productRepository.existsBySlug(cleanSlug)) {
            cleanSlug = cleanSlug + "-" + System.currentTimeMillis() % 1000;
        }

        ArtisanProfile artisan = null;
        if (request.getArtisanId() != null) {
            artisan = artisanProfileRepository.findById(request.getArtisanId()).orElse(null);
        }
        if (artisan == null && artisanProfileRepository.count() > 0) {
            artisan = artisanProfileRepository.findAll().get(0);
        }

        com.heritage.platform.modules.village.entity.CraftVillage village = null;
        if (request.getVillageId() != null) {
            village = craftVillageRepository.findById(request.getVillageId()).orElse(null);
        } else if (artisan != null) {
            village = artisan.getCraftVillage();
        }

        String initialStatus = request.getStatus() != null ? request.getStatus() : "PENDING_APPROVAL";

        Product product = Product.builder()
                .name(request.getName().trim())
                .skuCode(request.getSkuCode() != null ? request.getSkuCode().trim() : "SKU-" + System.currentTimeMillis() % 100000)
                .slug(cleanSlug)
                .artisan(artisan)
                .craftVillage(village)
                .categoryId(request.getCategoryId() != null ? request.getCategoryId() : 1)
                .description(request.getDescription())
                .materialInfo(request.getMaterialInfo())
                .artisanStory(request.getArtisanStory())
                .creationProcessVideoUrl(request.getCreationProcessVideoUrl())
                .dimensions(request.getDimensions())
                .weightGram(request.getWeightGram())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 1)
                .imageUrl(request.getImageUrl())
                .model3dUrl(request.getModel3dUrl())
                .status(initialStatus)
                .isUniqueArtwork(true)
                .build();

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public java.util.List<Product> getProductsByArtisan(Long artisanId) {
        return productRepository.findByArtisanIdAndIsDeletedFalse(artisanId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Product> getPendingProductsForVillage(Long villageId) {
        return productRepository.findByCraftVillageIdAndStatusAndIsDeletedFalse(villageId, "PENDING_APPROVAL");
    }

    @Transactional
    public Product reviewProduct(Long productId, Long adminUserId, boolean approved, String rejectionReason) {
        Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy sản phẩm với ID: " + productId));

        if (approved) {
            product.setStatus("APPROVED");
            product.setRejectionReason(null);
            log.info("[VILLAGE] Phê duyệt mẫu SKU: {} (id={})", product.getName(), product.getId());
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new BusinessException("VALIDATION_ERROR", "Lý do từ chối mẫu SKU không được để trống");
            }
            product.setStatus("REJECTED");
            product.setRejectionReason(rejectionReason.trim());
            log.info("[VILLAGE] Từ chối mẫu SKU: {} (id={}), Lý do: {}", product.getName(), product.getId(), rejectionReason);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tác phẩm"));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setMaterialInfo(request.getMaterialInfo());
        product.setDimensions(request.getDimensions());
        product.setWeightGram(request.getWeightGram());
        product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy tác phẩm"));
        product.setDeleted(true);
        product.setStatus("DELETED");
        productRepository.save(product);
    }
}
