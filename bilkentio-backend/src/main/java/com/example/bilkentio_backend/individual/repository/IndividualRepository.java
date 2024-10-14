package com.example.bilkentio_backend.individual.repository;
import com.example.bilkentio_backend.individual.entity.Individual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IndividualRepository extends JpaRepository<Individual, Long> {
    Optional<Individual> findByUsername(String username);
}
