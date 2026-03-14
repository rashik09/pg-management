package com.nexstay.repository;

import com.nexstay.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(String status);
    Optional<Property> findByIdAndStatus(Long id, String status);
}
