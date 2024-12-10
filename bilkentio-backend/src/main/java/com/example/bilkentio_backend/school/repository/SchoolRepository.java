package com.example.bilkentio_backend.school.repository;

import com.example.bilkentio_backend.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByCity(String city);

    List<School> findByPriorityRank(Integer priorityRank);

    @Query("SELECT DISTINCT s.city FROM School s ORDER BY s.city")
    List<String> findAllCities();

    Optional<School> findByName(String name);
}