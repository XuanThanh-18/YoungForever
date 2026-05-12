package com.toby.youngforever.repository;

import com.toby.youngforever.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    @Modifying
    @Query("UPDATE User u SET u.deletedAt = NOW() WHERE u.id = :id")
    void softDeleteById(UUID id);
}
