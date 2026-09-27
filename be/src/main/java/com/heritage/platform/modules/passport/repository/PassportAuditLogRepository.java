package com.heritage.platform.modules.passport.repository;

import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassportAuditLogRepository extends JpaRepository<PassportAuditLog, Long> {

    Optional<PassportAuditLog> findFirstByPassportIdOrderByScannedAtDesc(Long passportId);

    List<PassportAuditLog> findTop20ByPassportIdOrderByScannedAtDesc(Long passportId);
}
