package com.hexa.muinus.batch.job.preference;

import com.hexa.muinus.batch.domain.Preference;
import com.hexa.muinus.batch.exception.BatchErrorCode;
import com.hexa.muinus.batch.exception.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Map;

@Slf4j
@Component
public class PreferenceItemReader extends JdbcCursorItemReader<Preference> {

    private final static String mySqlQuery = """
                SELECT  ui.user_no, ui.item_id,
                        IFNULL(SUM(td.quantity), 0) AS daily_purchase_count,
                        IFNULL(SUM(up.monthly_score), 0) AS monthly_score 
                FROM (SELECT u.user_no, i.item_id FROM hexa.users u CROSS JOIN hexa.item i) AS ui 
                LEFT JOIN hexa.transactions t ON t.user_no = ui.user_no
                AND t.created_at >= ?
                AND t.created_at < ?               
                LEFT JOIN hexa.transaction_details td ON td.transaction_id = t.transaction_id
                AND td.store_item_id IS NOT NULL                
                LEFT JOIN ( SELECT p.user_no, p.item_id, SUM(p.daily_score) AS monthly_score
                            FROM hexa.preference p
                            WHERE p.updated_at >= ?
                            AND p.updated_at < ?
                            GROUP BY p.user_no, p.item_id ) up ON up.user_no = ui.user_no
                AND up.item_id = ui.item_id
                GROUP BY ui.user_no, ui.item_id
                ORDER BY ui.user_no, ui.item_id
            """;

    private final Map<String, Integer> redisCache;

    public PreferenceItemReader(DataSource dataSource, RedisTemplate<String, Object> redisTemplate) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate monthAgo = today.minusDays(29);

        HashOperations<String, String, Integer> hashOps = redisTemplate.opsForHash();
        String redisKey = "preference:search:count";
        this.redisCache = hashOps.entries(redisKey); // Redis 데이터를 한 번에 가져오기

        log.info("Loaded Preference Redis data size: {}", redisCache.size());

        setDataSource(dataSource);
        setSql(mySqlQuery);

        setPreparedStatementSetter(ps -> {
            ps.setDate(1, Date.valueOf(yesterday));
            ps.setDate(2, Date.valueOf(today));
            ps.setDate(3, Date.valueOf(monthAgo));
            ps.setDate(4, Date.valueOf(today));
        });

        setRowMapper(new RowMapper<Preference>() {
            @Override
            public Preference mapRow(ResultSet rs, int rowNum) throws SQLException {
                try {
                    Long userNo = rs.getLong("user_no");
                    Long itemId = rs.getLong("item_id");
                    int purchaseCount = rs.getInt("daily_purchase_count");
                    BigDecimal monthlyScore = rs.getBigDecimal("monthly_score") != null
                            ? rs.getBigDecimal("monthly_score")
                            : BigDecimal.ZERO;

                    // **Redis 캐시에서 검색 횟수 조회**
                    String redisKeyFormat = userNo + ":" + itemId;
                    int searchCount = redisCache.getOrDefault(redisKeyFormat, 0);

                    log.debug("Processing userNo: {}, itemId: {}, purchaseCount: {}, searchCount: {}",
                            userNo, itemId, purchaseCount, searchCount);

                    // 점수 계산
                    BigDecimal dailyScore = BigDecimal.valueOf(searchCount + purchaseCount);
                    BigDecimal updatedMonthlyScore = monthlyScore.add(dailyScore);

                    return Preference.builder()
                            .userNo(userNo)
                            .itemId(itemId)
                            .updatedAt(today)
                            .dailyScore(dailyScore)
                            .monthlyScore(updatedMonthlyScore)
                            .build();

                } catch (Exception e) {
                    throw new BatchProcessingException(BatchErrorCode.ROW_MAPPER_ERROR, e);
                }
            }
        });
    }
}
