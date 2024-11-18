package com.example.bilkentio_backend.form.repository;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByState(FormState state);
    List<Form> findBySubmittedBy_Id(Long userId);
    List<Form> findByStateOrderByLinkedSlot_Day_DateAsc(FormState state);
    List<Form> findBySubmittedBy_Username(String username);
}
