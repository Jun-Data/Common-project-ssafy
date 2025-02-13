package com.hexa.muinus.batch.job.preference;

import com.hexa.muinus.batch.domain.Preference;
import com.hexa.muinus.batch.domain.PreferenceId;
import com.hexa.muinus.batch.exeption.BatchErrorCode;
import com.hexa.muinus.batch.exeption.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import java.sql.Date;

@Slf4j
@Component
public class PreferenceItemReader implements ItemReader<Preference> {

    // MySQL 구매 횟수 + 기존 월간(29일치) 점수 조회
    private final static String mySqlQuery = """
                SELECT  ui.user_no, ui.item_id,
                        IFNULL(SUM(td.quantity), 0) AS daily_purchase_count,
                        IFNULL(SUM(up.monthly_score), 0) AS monthly_score 
                FROM (SELECT u.user_no, i.item_id FROM users u CROSS JOIN item i) AS ui 
                LEFT JOIN hexa.transactions t ON t.user_no = ui.user_no
                AND t.created_at >= ?
                AND t.created_at < ?               
                LEFT JOIN hexa.transaction_details td ON td.transaction_id = t.transaction_id
                AND td.store_item_id IS NOT NULL                
                LEFT JOIN ( SELECT p.user_no, p.item_id, SUM(p.daily_score) AS monthly_score
                            FROM preference p
                            WHERE p.updated_at >= ?
                            AND p.updated_at < ?
                            GROUP BY p.user_no, p.item_id ) up ON up.user_no = ui.user_no
                AND up.item_id = ui.item_id
                GROUP BY ui.user_no, ui.item_id
                ORDER BY ui.user_no, ui.item_id
            """;

    private final RedisTemplate<String, Object> redisTemplate;
    private final JdbcTemplate jdbcTemplate;
    private final Iterator<Preference> preferenceIterator;

    public PreferenceItemReader(RedisTemplate<String, Object> redisTemplate, @Qualifier("dataJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.redisTemplate = redisTemplate;
        this.jdbcTemplate = jdbcTemplate;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate monthAgo = today.minusDays(29);

        try {
            // MySQL 데이터 전체 로드
            List<Map<String, Object>> mySqlData = jdbcTemplate.queryForList(
                    mySqlQuery,
                    Date.valueOf(yesterday),    // 어제
                    Date.valueOf(today),        // 오늘
                    Date.valueOf(monthAgo),     // 29일 전 (오늘 포함 30일)
                    Date.valueOf(today)         //
            );
            log.info("Loaded Preference MySQL data size: {}", mySqlData.size());

            // Redis 데이터 전체 로드 (userNo:itemId -> searchCount)
            HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
            String redisKey = "preference:search:count";
            Map<String, Integer> redisData = hashOps.entries(redisKey);
            log.info("Loaded Preference Redis data size: {}", redisData.size());

            // 데이터 매핑 및 점수 계산
            List<Preference> preferences = new ArrayList<>();

            for (Map<String, Object> row : mySqlData) {
                Long userNo = ((Number) row.get("user_no")).longValue();
                Long itemId = ((Number) row.get("item_id")).longValue();
                int purchaseCount = ((Number) row.get("daily_purchase_count")).intValue();
                BigDecimal monthlyScore = (BigDecimal) row.getOrDefault("monthly_score", BigDecimal.ZERO);

                log.debug("Preference data - userNo: {}, itemId: {}, purchaseCount: {}", userNo, itemId, purchaseCount);

                // Redis에서 검색 횟수 가져오기 (없으면 0으로 처리)
                String redisKeyFormat = userNo + ":" + itemId;
                int searchCount = redisData.getOrDefault(redisKeyFormat, 0);

                log.debug("userNo: {}, itemId: {}, searchCount: {}", userNo, itemId, searchCount);

                // 점수 계산
                BigDecimal dailyScore = BigDecimal.valueOf(searchCount + purchaseCount);
                BigDecimal updatedMonthlyScore = monthlyScore.add(dailyScore);

                log.info("Preference data - date: {}, userNo: {}, itemId: {}, dailyScore: {}, monthlyScore: {}", yesterday,userNo, itemId, dailyScore, updatedMonthlyScore);

                // Preference 객체 생성
                PreferenceId id = new PreferenceId(userNo, itemId, yesterday);
                Preference preference = Preference.builder()
                        .id(id)
                        .dailyScore(dailyScore)
                        .monthlyScore(updatedMonthlyScore)
                        .build();

                preferences.add(preference);
            }

            // Iterator로 변환하여 반환
            this.preferenceIterator = preferences.iterator();

        } catch (Exception e) {
            log.error("Error loading data for PreferenceItemReader: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.SQL_EXECUTION_ERROR, e);
        }
    }

    @Override
    public Preference read() {
        if (preferenceIterator.hasNext()) {
            return preferenceIterator.next();
        }
        return null; // 데이터가 없으면 null 반환 (배치 종료)
    }


}