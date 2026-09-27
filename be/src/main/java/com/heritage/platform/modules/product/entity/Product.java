package com.heritage.platform.modules.product.entity;

import com.heritage.platform.common.entity.BaseEntity;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id", nullable = false)
    private ArtisanProfile artisan;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId; // 1: Gốm sứ, 2: Lụa, 3: Sơn mài, 4: Gỗ chạm, 5: Đúc đồng

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "material_info", nullable = false, columnDefinition = "TEXT")
    private String materialInfo;

    @Column(length = 100)
    private String dimensions;

    @Column(name = "weight_gram")
    private Integer weightGram;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 1;

    @Column(name = "is_unique_artwork", nullable = false)
    @Builder.Default
    private Boolean isUniqueArtwork = false;

    @Column(name = "model_3d_url")
    private String model3dUrl; // File .glb / .gltf nén Draco <= 15MB

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PUBLISHED"; // DRAFT, PENDING_APPROVAL, PUBLISHED, ARCHIVED
}
