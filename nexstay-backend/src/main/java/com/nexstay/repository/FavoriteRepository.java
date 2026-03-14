package com.nexstay.repository;

import com.nexstay.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderByIdDesc(Long userId);
    Optional<Favorite> findByUserIdAndPgId(Long userId, Long pgId);
    void deleteByUserIdAndPgId(Long userId, Long pgId);
    boolean existsByUserIdAndPgId(Long userId, Long pgId);
}
