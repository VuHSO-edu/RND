package com.heritage.platform.modules.order.repository;

import com.heritage.platform.modules.order.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<Order> findByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
