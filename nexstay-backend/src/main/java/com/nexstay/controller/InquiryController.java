package com.nexstay.controller;

import com.nexstay.entity.Inquiry;
import com.nexstay.entity.Property;
import com.nexstay.entity.User;
import com.nexstay.repository.InquiryRepository;
import com.nexstay.repository.PropertyRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // GET /api/inquiries (owner only)
    @GetMapping("/inquiries")
    public ResponseEntity<?> getAllInquiries(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized!"));
        }

        List<Inquiry> inquiries = inquiryRepository.findAllByOrderByIdAsc();
        List<Map<String, Object>> result = inquiries.stream().map(i -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", i.getId());
            map.put("name", i.getName());
            map.put("phone", i.getPhone());
            map.put("pgId", i.getPgId());
            map.put("date", i.getDate());
            map.put("status", i.getStatus());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // POST /api/inquiries (authenticated user)
    @PostMapping("/inquiries")
    public ResponseEntity<?> createInquiry(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token is missing!"));
        }

        Inquiry inq = new Inquiry();
        inq.setUserId(user.getId());
        inq.setName(user.getName());
        inq.setPhone((String) body.get("phone"));
        inq.setPgId(Long.parseLong(body.get("pgId").toString()));
        inq.setDate((String) body.get("date"));
        inq.setStatus("pending");

        inquiryRepository.save(inq);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Inquiry submitted"));
    }

    // GET /api/user/inquiries (user's own inquiries with PG details)
    @GetMapping("/user/inquiries")
    public ResponseEntity<?> getUserInquiries(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token is missing!"));
        }

        List<Inquiry> inquiries = inquiryRepository.findByUserIdOrderByIdDesc(user.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Inquiry inq : inquiries) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", inq.getId());
            map.put("date", inq.getDate());
            map.put("status", inq.getStatus());

            // Join with property data
            var pgOpt = propertyRepository.findById(inq.getPgId());
            if (pgOpt.isPresent()) {
                Property pg = pgOpt.get();
                map.put("title", pg.getTitle());
                map.put("location", pg.getLocation());
                map.put("city", pg.getCity());
                map.put("image", pg.getImage());
            } else {
                map.put("title", "Unknown PG");
                map.put("location", "");
                map.put("city", "");
                map.put("image", "");
            }
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    // PUT /api/inquiries/{id} (owner only - mark contacted)
    @PutMapping("/inquiries/{id}")
    public ResponseEntity<?> updateInquiry(@PathVariable Long id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized!"));
        }

        var opt = inquiryRepository.findById(id);
        if (opt.isPresent()) {
            Inquiry inq = opt.get();
            inq.setStatus("contacted");
            inquiryRepository.save(inq);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Inquiry updated"));
    }
}
