package com.hexa.muinus.users.domain.preference.repository;

import com.hexa.muinus.users.domain.preference.Preference;
import com.hexa.muinus.users.domain.preference.PreferenceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.time.LocalDate;
import java.util.List;

public interface PreferenceRepository extends JpaRepository<Preference, PreferenceId> {
    @Query(value = """
        SELECT i.item_name
        FROM preference p
        JOIN users u ON u.user_no = p.user_no
        AND  u.email = :userEmail
        JOIN item i ON i.item_no = p.item_no
        WHERE p.user_no = 1
        AND p.updated_at = :today
        AND		daily_score = 0 -- 어제 안 먹은거
        ORDER BY monthly_score DESC
        LIMIT 10
    """, nativeQuery = true)
    public List<String> findItemsByScore(String userEmail, LocalDate today);
}
