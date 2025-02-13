package com.hexa.muinus.batch.job.dailysales;

import com.hexa.muinus.batch.domain.DailySales;
import com.hexa.muinus.batch.exception.BatchErrorCode;
import com.hexa.muinus.batch.exception.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class DailySalesItemWriterConfig {

    private final DataSource dataDBSource;

    private static final String QUERY = """
        INSERT INTO hexa.daily_sales (sale_date, store_no, item_id, total_quantity, total_amount)
        VALUES (:saleDate, :storeNo, :itemId, :totalQuantity, :totalAmount)
        ON DUPLICATE KEY UPDATE
        total_quantity = VALUES(total_quantity),
        total_amount = VALUES(total_amount)
    """;

    public DailySalesItemWriterConfig(@Qualifier("dataDBSource") DataSource dataDBSource) {
        this.dataDBSource = dataDBSource;
    }

    @Bean
    public JdbcBatchItemWriter<DailySales> dailySalesItemWriter() {
        try {
            log.info("Daily Sales Writer 초기화 시작");
            return new JdbcBatchItemWriterBuilder<DailySales>()
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
