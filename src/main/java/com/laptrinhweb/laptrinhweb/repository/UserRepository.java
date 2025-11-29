package com.laptrinhweb.laptrinhweb.repository;

import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity , Long> {
    boolean existsByUserName(String userName);

    Optional<UserEntity> findByUserName(String userName);

    @Query("SELECT u FROM UserEntity u WHERE u.userName LIKE %:keyword% OR u.phone LIKE %:keyword%")
    List<UserEntity> searchUsers(@Param("keyword") String keyword);
}
