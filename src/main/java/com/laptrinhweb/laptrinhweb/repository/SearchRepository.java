package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SearchRepository extends JpaRepository<ProductEntity , Long> {
    @Query("SELECT p FROM ProductEntity p WHERE p.name LIKE %:keyword% OR p.category.name LIKE %:keyword%")
    Page<ProductEntity> searchProducts(@Param("keyword") String keyword , Pageable pageable);
}
