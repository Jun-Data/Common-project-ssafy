package com.hexa.muinus.batch.job.dailysales;

import com.hexa.muinus.batch.domain.DailySales;
import com.hexa.muinus.batch.exception.BatchErrorCode;
import com.hexa.muinus.batch.exception.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Slf4j
@Configuration
@EnableBatchProcessing(dataSourceRef = "dataDBSource", transactionManagerRef = "metaTransactionManager")
public class DailySalesBatchConfig {

    private final PlatformTransactionManager transactionManager;
    private final JobRepository jobRepository;
    private final DailySalesItemReader dailySalesItemReader;
    private final JdbcBatchItemWriter<DailySales> dailySalesItemWriter;

    public DailySalesBatchConfig(
            @Qualifier("metaTransactionManager") PlatformTransactionManager transactionManager,
            @Qualifier("jobRepository") JobRepository jobRepository,
            DailySalesItemReader dailySalesItemReader,
            JdbcBatchItemWriter<DailySales> dailySalesItemWriter) {
        this.transactionManager = transactionManager;
        this.jobRepository = jobRepository;
        this.dailySalesItemReader = dailySalesItemReader;
        this.dailySalesItemWriter = dailySalesItemWriter;
    }

    @Bean
    public Job dailySalesBatchJob() {
        try {
            log.info("Daily Sales Batch Job 생성 시작");
            return new JobBuilder("DailySalesBatchJob", jobRepository)
                    .start(dailySalesStep())
                    .build();
        } catch (Exception e) {
            log.error("배치 Job 생성 실패: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.JOB_CREATION_FAILED, e);
        }
    }

    @Bean
    public Step dailySalesStep() {
        try {
            log.info("Daily Sales Step 생성 시작");
            return new StepBuilder("dailySalesStep", jobRepository)
                    .<DailySales, DailySales>chunk(10, transactionManager)
                    .allowStartIfComplete(true)
                    .reader(dailySalesItemReader)
                    .writer(dailySalesItemWriter)
                    .build();
        } catch (Exception e) {
            log.error("배치 Step 생성 실패: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.STEP_CREATION_FAILED, e);
        }
    }
}

