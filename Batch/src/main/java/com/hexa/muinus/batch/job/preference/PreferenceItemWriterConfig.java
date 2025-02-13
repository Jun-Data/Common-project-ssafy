package com.hexa.muinus.batch.job.preference;

import com.hexa.muinus.batch.domain.Preference;
import com.hexa.muinus.batch.exeption.BatchErrorCode;
import com.hexa.muinus.batch.exeption.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class PreferenceItemWriterConfig {

    private final DataSource dataDBSource;

    private static final String QUERY = """
        INSERT INTO preference (user_no, item_id, updated_at, daily_score, monthly_score)
        VALUES (:id.userNo, :id.itemId, :id.updatedAt, :dailyScore, :monthlyScore)
    """;
//    ON DUPLICATE KEY UPDATE
//    daily_score = VALUES(daily_score),
//    monthly_score = VALUES(monthly_score)

    public PreferenceItemWriterConfig(@Qualifier("dataDBSource") DataSource dataDBSource) {
        this.dataDBSource = dataDBSource;
    }

    @Bean
    public JdbcBatchItemWriter<Preference> preferenceItemWriter() {
        try {
            log.info("Preference Writer 초기화 시작");
            return new JdbcBatchItemWriterBuilder<Preference>()
                    .dataSource(dataDBSource)
                    .sql(QUERY)
                    .beanMapped()
                    .build();
        } catch (Exception e) {
            log.error("Writer 초기화 실패: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.WRITER_INITIALIZATION_FAILED, e);
        }
    }
}
