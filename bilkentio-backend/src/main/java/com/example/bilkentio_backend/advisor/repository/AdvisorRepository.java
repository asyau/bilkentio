package com.example.bilkentio_backend.advisor.repository;
import com.example.bilkentio_backend.advisor.entity.Advisor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdvisorRepository extends JpaRepository<Advisor, Long> {
    Optional<Advisor> findByUsername(String username);
}
