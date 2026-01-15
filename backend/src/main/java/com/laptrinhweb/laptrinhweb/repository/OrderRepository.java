package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import com.laptrinhweb.laptrinhweb.entity.CartEntity;
import com.laptrinhweb.laptrinhweb.entity.OrderEntity;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity , Long> {
    Page<OrderEntity> findByOrderStatus(OrderStatus orderStatus, Pageable pageable);
    Page<OrderEntity> findByUser(UserEntity user, Pageable pageable);

    List<OrderEntity> findByOrderStatus(OrderStatus orderStatus);
}
