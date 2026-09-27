package com.heritage.platform.modules.gis.repository;

import com.heritage.platform.modules.gis.entity.OrgUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrgUnitRepository extends JpaRepository<OrgUnit, Long> {
    List<OrgUnit> findByIsDeletedFalseOrderByLevelAscCodeAsc();
    List<OrgUnit> findByParentCodeAndIsDeletedFalse(String parentCode);
    Optional<OrgUnit> findByCodeAndIsDeletedFalse(String code);
    boolean existsByCode(String code);
}
