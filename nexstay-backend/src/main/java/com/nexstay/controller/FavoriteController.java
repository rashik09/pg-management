package com.nexstay.controller;

import com.nexstay.entity.Favorite;
import com.nexstay.entity.Property;
import com.nexstay.entity.User;
import com.nexstay.repository.FavoriteRepository;
import com.nexstay.repository.PropertyRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // GET /api/favorites
    @GetMapping
    public ResponseEntity<?> getFavorites(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token is missing!"));
        }

        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByIdDesc(user.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Favorite fav : favorites) {
            var pgOpt = propertyRepository.findByIdAndStatus(fav.getPgId(), "active");
            if (pgOpt.isPresent()) {
                Property pg = pgOpt.get();
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", fav.getId());
                map.put("pg_id", fav.getPgId());
                map.put("created_at", fav.getCreatedAt());
                map.put("title", pg.getTitle());
                map.put("location", pg.getLocation());
                map.put("city", pg.getCity());
                map.put("image", pg.getImage());
                map.put("price", pg.getPrice());
                map.put("type", pg.getType());
                map.put("vacancies", pg.getVacancies());
                result.add(map);
            }
        }

        return ResponseEntity.ok(result);
    }

    // POST /api/favorites
    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token is missing!"));
        }

        Long pgId = Long.parseLong(body.get("pg_id").toString());

        if (favoriteRepository.existsByUserIdAndPgId(user.getId(), pgId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Already in favorites"));
        }

        Favorite fav = new Favorite();
        fav.setUserId(user.getId());
        fav.setPgId(pgId);
        fav.setCreatedAt(Instant.now().toString());
        favoriteRepository.save(fav);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Added to favorites"));
    }

    // DELETE /api/favorites/{pgId}
    @DeleteMapping("/{pgId}")
    @Transactional
    public ResponseEntity<?> removeFavorite(@PathVariable Long pgId, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token is missing!"));
        }

        favoriteRepository.deleteByUserIdAndPgId(user.getId(), pgId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Removed from favorites"));
    }
}
