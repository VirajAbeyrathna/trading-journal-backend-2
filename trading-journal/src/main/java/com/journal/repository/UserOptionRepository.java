package com.journal.repository;

import com.journal.entity.UserOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserOptionRepository extends JpaRepository<UserOption, Long> {
    List<UserOption> findByUserId(Long userId);
    List<UserOption> findByUserIdAndType(Long userId, String type);
}
