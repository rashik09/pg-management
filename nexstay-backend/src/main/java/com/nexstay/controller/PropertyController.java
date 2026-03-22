package com.nexstay.controller;

import com.nexstay.entity.Property;
import com.nexstay.entity.User;
import com.nexstay.repository.PropertyRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.*;

@RestController
@RequestMapping("/api/pgs")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Convert gallery JSON string to List for API response
    private Map<String, Object> toResponse(Property p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("title", p.getTitle());
        map.put("location", p.getLocation());
        map.put("city", p.getCity());
        map.put("price", p.getPrice());
        map.put("type", p.getType());
        map.put("image", p.getImage());
        map.put("vacancies", p.getVacancies());
        map.put("sharing_type", p.getSharingType());
        map.put("bathroom_type", p.getBathroomType());
        map.put("has_ac", p.getHasAc() != null && p.getHasAc());
        map.put("has_wifi", p.getHasWifi() != null && p.getHasWifi());
        map.put("has_hot_water", p.getHasHotWater() != null && p.getHasHotWater());
        map.put("description", p.getDescription());
        map.put("featured", p.getFeatured() != null && p.getFeatured());
        map.put("status", p.getStatus());

        // Parse gallery JSON string into array
        try {
            if (p.getGallery() != null && !p.getGallery().isEmpty()) {
                map.put("gallery", objectMapper.readValue(p.getGallery(), new TypeReference<List<String>>() {}));
            } else {
                map.put("gallery", Collections.emptyList());
            }
        } catch (JsonProcessingException e) {
            map.put("gallery", Collections.emptyList());
        }
        return map;
    }

    // GET /api/pgs
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPgs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort) {

        String sortField = sort[0];
        Sort.Direction sortDirection = sort.length > 1 && sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable paging = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<Property> pageProps = propertyRepository.findByStatus("active", paging);
        List<Map<String, Object>> content = pageProps.getContent().stream().map(this::toResponse).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("currentPage", pageProps.getNumber());
        response.put("totalItems", pageProps.getTotalElements());
        response.put("totalPages", pageProps.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // GET /api/pgs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getPgById(@PathVariable Long id) {
        var opt = propertyRepository.findByIdAndStatus(id, "active");
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Property not found"));
        }
        return ResponseEntity.ok(toResponse(opt.get()));
    }

    // POST /api/pgs (owner only)
    @PostMapping
    public ResponseEntity<?> createPg(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized! Owner access required."));
        }

        Property p = new Property();
        p.setTitle((String) body.get("title"));
        p.setLocation((String) body.get("location"));
        p.setCity((String) body.get("city"));
        p.setPrice(Integer.parseInt(body.get("price").toString()));
        p.setType((String) body.get("type"));
        p.setImage((String) body.getOrDefault("image", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"));
        p.setVacancies(Integer.parseInt(body.get("vacancies").toString()));
        p.setSharingType((String) body.get("sharing_type"));
        p.setBathroomType((String) body.get("bathroom_type"));
        p.setHasAc(Boolean.TRUE.equals(body.get("has_ac")));
        p.setHasWifi(Boolean.TRUE.equals(body.get("has_wifi")));
        p.setHasHotWater(Boolean.TRUE.equals(body.get("has_hot_water")));
        p.setDescription((String) body.getOrDefault("description", "A beautiful new PG property."));
        try {
            Object gallery = body.get("gallery");
            p.setGallery(gallery != null ? objectMapper.writeValueAsString(gallery) : "[]");
        } catch (JsonProcessingException e) {
            p.setGallery("[]");
        }
        p.setFeatured(false);
        p.setStatus("active");

        propertyRepository.save(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "PG added successfully"));
    }

    // PUT /api/pgs/{id} (owner only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePg(@PathVariable Long id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized!"));
        }

        var opt = propertyRepository.findByIdAndStatus(id, "active");
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Property not found"));
        }

        Property p = opt.get();
        p.setTitle((String) body.get("title"));
        p.setLocation((String) body.get("location"));
        p.setCity((String) body.get("city"));
        p.setPrice(Integer.parseInt(body.get("price").toString()));
        p.setType((String) body.get("type"));
        p.setVacancies(Integer.parseInt(body.get("vacancies").toString()));
        p.setSharingType((String) body.get("sharing_type"));
        p.setBathroomType((String) body.get("bathroom_type"));
        p.setHasAc(Boolean.TRUE.equals(body.get("has_ac")));
        p.setHasWifi(Boolean.TRUE.equals(body.get("has_wifi")));
        p.setHasHotWater(Boolean.TRUE.equals(body.get("has_hot_water")));
        p.setDescription((String) body.getOrDefault("description", p.getDescription()));

        // Preserve existing images if not provided
        if (body.containsKey("image") && body.get("image") != null) {
            p.setImage((String) body.get("image"));
        }
        if (body.containsKey("gallery") && body.get("gallery") != null) {
            try {
                List<?> galleryList = (List<?>) body.get("gallery");
                if (!galleryList.isEmpty()) {
                    p.setGallery(objectMapper.writeValueAsString(galleryList));
                }
            } catch (Exception e) { /* keep existing */ }
        }

        propertyRepository.save(p);
        return ResponseEntity.ok(Map.of("success", true, "message", "PG updated successfully"));
    }

    // DELETE /api/pgs/{id} (owner only, soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePg(@PathVariable Long id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized!"));
        }

        var opt = propertyRepository.findById(id);
        if (opt.isPresent()) {
            Property p = opt.get();
            p.setStatus("deleted");
            propertyRepository.save(p);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "PG deleted successfully"));
    }
}
