package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<ProductEntity , Long> {
    boolean existsByName(String name);
    Page<ProductEntity> findByCategory_id(Long categoryId, Pageable pageable);

    Optional<ProductEntity> findByName(String productName);
}
