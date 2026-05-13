package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndId(UUID userId, UUID addressId);

    /** Unset default on all addresses for this user before setting a new one */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = FALSE WHERE a.user.id = :userId")
    void clearDefaultByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Address a SET a.deletedAt = NOW() WHERE a.id = :id AND a.user.id = :userId")
    void softDeleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}