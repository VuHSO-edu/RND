package com.heritage.platform.modules.passport.repository;

import com.heritage.platform.modules.passport.entity.HeritagePassport;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeritagePassportRepository extends JpaRepository<HeritagePassport, Long> {

    @EntityGraph(attributePaths = {"product", "product.artisan", "product.artisan.user", "product.artisan.craftVillage"})
    Optional<HeritagePassport> findByPassportCode(String passportCode);

    @EntityGraph(attributePaths = {"product", "product.artisan", "product.artisan.user", "product.artisan.craftVillage"})
    Optional<HeritagePassport> findByNfcTagUid(String nfcTagUid);

    @EntityGraph(attributePaths = {"product", "product.artisan", "product.artisan.user", "product.artisan.craftVillage"})
    Optional<HeritagePassport> findByProductId(Long productId);
}
