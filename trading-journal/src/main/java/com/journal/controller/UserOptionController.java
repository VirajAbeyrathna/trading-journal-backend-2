package com.journal.controller;

import com.journal.entity.UserOption;
import com.journal.repository.UserOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-options")
@CrossOrigin
public class UserOptionController {

    @Autowired
    private UserOptionRepository userOptionRepository;

    @GetMapping("/all")
    public ResponseEntity<List<UserOption>> getAllUserOptions() {
        List<UserOption> options = userOptionRepository.findAll();
        return ResponseEntity.ok(options);
    }

    @GetMapping
    public ResponseEntity<List<UserOption>> getUserOptions(@RequestParam Long userId) {
        List<UserOption> options = userOptionRepository.findByUserId(userId);
        return ResponseEntity.ok(options);
    }

    @PostMapping
    public ResponseEntity<UserOption> createUserOption(@RequestBody UserOption userOption) {
        UserOption savedOption = userOptionRepository.save(userOption);
        return ResponseEntity.ok(savedOption);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserOption> updateUserOption(@PathVariable Long id, @RequestBody UserOption userOptionDetails) {
        Optional<UserOption> optionalOption = userOptionRepository.findById(id);
        if (optionalOption.isPresent()) {
            UserOption existingOption = optionalOption.get();
            existingOption.setType(userOptionDetails.getType());
            existingOption.setValue(userOptionDetails.getValue());
            // Preserve userId if not provided in details, or update it
            if (userOptionDetails.getUserId() != null) {
                existingOption.setUserId(userOptionDetails.getUserId());
            }
            UserOption updatedOption = userOptionRepository.save(existingOption);
            return ResponseEntity.ok(updatedOption);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserOption(@PathVariable Long id) {
        if (userOptionRepository.existsById(id)) {
            userOptionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
