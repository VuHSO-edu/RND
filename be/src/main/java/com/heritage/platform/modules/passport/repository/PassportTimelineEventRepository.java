package com.heritage.platform.modules.passport.repository;

import com.heritage.platform.modules.passport.entity.PassportTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassportTimelineEventRepository extends JpaRepository<PassportTimelineEvent, Long> {

    List<PassportTimelineEvent> findBySerialNumberOrderByEventTimeAsc(String serialNumber);

    List<PassportTimelineEvent> findByPassportIdOrderByEventTimeAsc(Long passportId);
}
