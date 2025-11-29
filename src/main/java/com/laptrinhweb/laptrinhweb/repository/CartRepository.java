package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.CartEntity;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface CartRepository extends JpaRepository<CartEntity, Integer> {
    Optional<CartEntity> findByUser(UserEntity user);
    Optional<CartEntity> findByUser_Id(int id);
}

