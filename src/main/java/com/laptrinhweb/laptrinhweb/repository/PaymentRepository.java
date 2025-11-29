package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.OrderEntity;
import com.laptrinhweb.laptrinhweb.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentEntity , Long> {
    List<PaymentEntity> findByOrder(OrderEntity order);
}
