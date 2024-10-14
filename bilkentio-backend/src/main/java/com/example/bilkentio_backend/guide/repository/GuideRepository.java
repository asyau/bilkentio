package com.example.bilkentio_backend.guide.repository;
import com.example.bilkentio_backend.guide.entity.Guide;
import com.example.bilkentio_backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuideRepository extends JpaRepository<Guide, Long> {
    Optional<Guide> findByUsername(String username);
}
