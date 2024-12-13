package com.example.bilkentio_backend.form.repository;

import com.example.bilkentio_backend.form.entity.Form;
import com.example.bilkentio_backend.form.enums.FormState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByState(FormState state);
    List<Form> findBySubmittedBy_Id(Long userId);
    List<Form> findBySubmittedBy_Username(String username);
    List<Form> findByStateOrderByLinkedSlot_Day_DateAsc(FormState state);
    List<Form> findByLinkedSlot_IdAndStateAndIdNot(Long slotId, FormState state, Long formId);
    
    // New methods for school-related queries
    List<Form> findBySchool_Id(Long schoolId);
    List<Form> findBySchool_IdAndState(Long schoolId, FormState state);
    List<Form> findBySchool_IdOrderByLinkedSlot_Day_DateAsc(Long schoolId);
}
