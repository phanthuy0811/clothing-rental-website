package com.laptrinhweb.laptrinhweb.repository;


import com.laptrinhweb.laptrinhweb.entity.CommentEntity;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    Page<CommentEntity> findByProduct(ProductEntity product, Pageable pageable);

}
