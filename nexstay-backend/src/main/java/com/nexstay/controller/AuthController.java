package com.nexstay.controller;

import com.nexstay.entity.User;
import com.nexstay.repository.InquiryRepository;
import com.nexstay.repository.PropertyRepository;
import com.nexstay.repository.UserRepository;
import com.nexstay.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private InquiryRepository inquiryRepository;
    @Autowired private PropertyRepository propertyRepository;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.get("role");

        if (name == null || email == null || password == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already exists"));
        }

        User user = new User(name, email, passwordEncoder.encode(password), role);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Successfully registered!"));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing credentials"));
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        User user = userOpt.get();
        String token = jwtService.generateToken(user.getId(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("name", user.getName());
        response.put("role", user.getRole());
        return ResponseEntity.ok(response);
    }

    // GET /api/auth/me — profile + stats
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());

        if ("owner".equals(user.getRole())) {
            long pgCount = propertyRepository.findByStatus("active").size();
            long inquiryCount = inquiryRepository.findAllByOrderByIdAsc().size();
            profile.put("pgs_posted", pgCount);
            profile.put("total_inquiries_received", inquiryCount);
        } else {
            long inquiryCount = inquiryRepository.findByUserIdOrderByIdDesc(user.getId()).size();
            profile.put("pgs_contacted", inquiryCount);
        }

        return ResponseEntity.ok(profile);
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        return ResponseEntity.ok(Map.of("message", "Password reset link sent to " + email));
    }
}
