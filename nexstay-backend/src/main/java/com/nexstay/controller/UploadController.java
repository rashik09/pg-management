package com.nexstay.controller;

import com.nexstay.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp");

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"owner".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized!"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No selected file"));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file name"));
        }

        String ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file type. Only JPG, PNG, WEBP allowed."));
        }

        String uniqueName = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(uniqueName);
            file.transferTo(filePath.toFile());

            String publicUrl = "/uploads/" + uniqueName;
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "url", publicUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}
