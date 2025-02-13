//package com.hexa.muinus.batch.job.preference_before;
//
//import com.hexa.muinus.batch.exeption.BatchErrorCode;
//import com.hexa.muinus.batch.exeption.BatchProcessingException;
//import com.hexa.muinus.batch.domain.Preference;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.batch.item.database.JdbcBatchItemWriter;
//import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import javax.sql.DataSource;
//
//@Slf4j
//@Configuration
//public class PreferenceItemWriterConfig_bf {
//    private final static String query = """
//                    INSERT INTO hexa.preference (user_no, item_id, score, updated_at)
//                    VALUES (:userNo, :itemId, :score, :updatedAt)
//                    ON DUPLICATE KEY UPDATE score = VALUES(score), updated_at = VALUES(updated_at)
//                    """
//            ;
//
//    private final DataSource dataDBSource;
//
//    public PreferenceItemWriterConfig_bf(@Qualifier("dataDBSource") DataSource dataDBSource) {
//        this.dataDBSource = dataDBSource;
//    }
//
//    @Bean
//    public JdbcBatchItemWriter<Preference> preferenceItemWriter() {
//        try {
//            log.debug("Preference Writer 초기화 시작");
//            return new JdbcBatchItemWriterBuilder<Preference>()
//                    .dataSource(dataDBSource)
//                    .sql(query)
//                    .beanMapped()
//                    .build();
//        } catch (Exception e) {
//            log.error("Writer 초기화 실패: {}", e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.WRITER_INITIALIZATION_FAILED, e);
//        }
//    }
//}