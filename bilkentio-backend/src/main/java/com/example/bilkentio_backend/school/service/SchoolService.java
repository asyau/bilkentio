package com.example.bilkentio_backend.school.service;

import com.example.bilkentio_backend.school.entity.School;
import com.example.bilkentio_backend.school.repository.SchoolRepository;
import com.example.bilkentio_backend.guidanceCounselor.entity.GuidanceCounselor;
import com.example.bilkentio_backend.guidanceCounselor.repository.GuidanceCounselorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SchoolService {
    private static final Logger logger = LoggerFactory.getLogger(SchoolService.class);

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private GuidanceCounselorRepository guidanceCounselorRepository;

    @Transactional
    public void importSchoolsFromCsv(String filePath) {
        List<School> schools = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            // Skip header
            String line = br.readLine();

            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                if (values.length >= 3) {
                    School school = new School();
                    school.setName(values[0].trim());
                    school.setCity(values[1].trim());
                    school.setPriorityRank(Integer.parseInt(values[2].trim()));
                    schools.add(school);
                }
            }

            schoolRepository.saveAll(schools);
            logger.info("Successfully imported {} schools", schools.size());

        } catch (IOException e) {
            logger.error("Failed to import schools from CSV", e);
            throw new RuntimeException("Failed to import schools", e);
        }
    }

    public List<School> getAllSchools() {
        return schoolRepository.findAll();
    }

    public List<String> getAllCities() {
        return schoolRepository.findAllCities();
    }

    public List<School> getSchoolsByCity(String city) {
        return schoolRepository.findByCity(city);
    }

    public List<School> getSchoolsByPriorityRank(Integer priorityRank) {
        return schoolRepository.findByPriorityRank(priorityRank);
    }

    public Optional<School> findByName(String name) {
        return schoolRepository.findByName(name);
    }

    public List<GuidanceCounselor> getSchoolCounselors(Long schoolId) {
        return guidanceCounselorRepository.findBySchoolId(schoolId);
    }
}
