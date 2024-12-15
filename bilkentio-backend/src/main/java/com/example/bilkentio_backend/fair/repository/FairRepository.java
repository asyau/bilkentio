package com.example.bilkentio_backend.fair.repository;

import com.example.bilkentio_backend.fair.entity.Fair;
import com.example.bilkentio_backend.fair.enums.FairStatus;
import com.example.bilkentio_backend.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FairRepository extends JpaRepository<Fair, Long> {
    List<Fair> findByStatus(FairStatus status);

    List<Fair> findByAssignedGuide(User guide);

    List<Fair> findBySchoolRankBetween(Double minRank, Double maxRank);

    List<Fair> findByCity(String city);

    List<Fair> findByAssignedGuide_Id(Long guideId);
}