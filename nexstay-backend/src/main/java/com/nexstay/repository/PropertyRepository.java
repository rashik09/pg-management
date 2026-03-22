package com.nexstay.repository;

import com.nexstay.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(String status);
    Page<Property> findByStatus(String status, Pageable pageable);
    Optional<Property> findByIdAndStatus(Long id, String status);
}
