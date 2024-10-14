package com.example.bilkentio_backend.president.repository;
import com.example.bilkentio_backend.president.entity.President;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PresidentRepository extends JpaRepository<President, Long> {
    Optional<President> findByUsername(String username);
}
