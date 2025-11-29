package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.CartEntity;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import com.laptrinhweb.laptrinhweb.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<WalletEntity, Long> {
    Optional<WalletEntity> findByUser(UserEntity user);
}
