package com.journal.controller;

import com.journal.entity.User;
import com.journal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User savedUser = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("userId", savedUser.getId());
        response.put("message", "User registered successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        // TODO: Implement actual authentication logic
        Map<String, Object> response = new HashMap<>();
        response.put("userId", 1L); // Placeholder
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // TODO: Implement actual logout logic
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/profile-image")
    public ResponseEntity<?> getProfileImage() {
        // TODO: Implement actual profile image retrieval logic
        Map<String, String> response = new HashMap<>();
        response.put("profileImageUrl", "https://example.com/default-profile.png"); // Placeholder
        return ResponseEntity.ok(response);
    }
}
