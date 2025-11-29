package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.ItemEntity;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<ItemEntity, Integer> {
    Optional<ItemEntity> findByProduct(ProductEntity product);

//    Optional<ItemEntity> findByProductAndSize(ProductEntity product, String size);

}

