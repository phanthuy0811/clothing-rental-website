package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.OrderDetailEntity;
import com.laptrinhweb.laptrinhweb.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity , Long> {
    List<OrderDetailEntity> findByOrder(OrderEntity order);
}
