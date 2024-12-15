package com.example.bilkentio_backend.assistant.repository;

import com.example.bilkentio_backend.assistant.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByUserIdAndLastUpdateTimeAfter(String userId, LocalDateTime time);
} 