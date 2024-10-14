package com.example.bilkentio_backend.guidanceCounselor.repository;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuidanceCounselorRepository extends JpaRepository<GuidanceCounselor, Long> {
    Optional<GuidanceCounselor> findByUsername(String username);
}
