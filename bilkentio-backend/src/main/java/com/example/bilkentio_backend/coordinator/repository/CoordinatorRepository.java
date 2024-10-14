package com.example.bilkentio_backend.coordinator.repository;
import com.example.bilkentio_backend.coordinator.entity.Coordinator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoordinatorRepository extends JpaRepository<Coordinator, Long> {
    Optional<Coordinator> findByUsername(String username);
}
