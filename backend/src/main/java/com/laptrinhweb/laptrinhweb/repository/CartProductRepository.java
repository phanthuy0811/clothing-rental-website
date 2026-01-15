package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.CartEntity;
import com.laptrinhweb.laptrinhweb.entity.CartProductEntity;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartProductRepository extends JpaRepository<CartProductEntity, Long> {
    Optional<CartProductEntity> findByCartAndProductAndSize(CartEntity cart, ProductEntity product, String size);
}
