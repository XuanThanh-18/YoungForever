package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {
    Optional<Blog> findBySlugAndIsPublishedTrue(String slug);
    Page<Blog> findByIsPublishedTrueOrderByPublishedAtDesc(Pageable pageable);
    boolean existsBySlug(String slug);
}
