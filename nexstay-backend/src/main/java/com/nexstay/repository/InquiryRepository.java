package com.nexstay.repository;

import com.nexstay.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserIdOrderByIdDesc(Long userId);
    List<Inquiry> findAllByOrderByIdAsc();
}
