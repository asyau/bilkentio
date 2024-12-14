package com.example.bilkentio_backend.fair.repository;

import com.example.bilkentio_backend.fair.entity.Fair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FairRepository extends JpaRepository<Fair, Long> {
    List<Fair> findByStatus(String status);

    List<Fair> findBySchoolRankBetween(Double minRank, Double maxRank);

    List<Fair> findByCity(String city);
}