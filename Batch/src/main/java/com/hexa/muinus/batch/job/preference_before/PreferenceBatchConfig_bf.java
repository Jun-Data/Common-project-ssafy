//package com.hexa.muinus.batch.job.preference;
//
//import com.hexa.muinus.batch.domain.Preference;
//import com.hexa.muinus.batch.exeption.BatchErrorCode;
//import com.hexa.muinus.batch.exeption.BatchProcessingException;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.batch.core.Job;
//import org.springframework.batch.core.Step;
//import org.springframework.batch.core.job.builder.JobBuilder;
//import org.springframework.batch.core.repository.JobRepository;
//import org.springframework.batch.core.step.builder.StepBuilder;
//import org.springframework.batch.item.database.JdbcBatchItemWriter;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.transaction.PlatformTransactionManager;
//
//@Slf4j
//@Configuration
//public class PreferenceBatchConfig {
//
//    private final PlatformTransactionManager transactionManager;
//    private final JobRepository jobRepository;
//    private final PreferenceItemReader preferenceItemReader;
//    private final JdbcBatchItemWriter<Preference> preferenceItemWriter;
//
//    public PreferenceBatchConfig(
//            @Qualifier("metaTransactionManager") PlatformTransactionManager transactionManager,
//            @Qualifier("jobRepository") JobRepository jobRepository,
//            PreferenceItemReader preferenceItemReader,
//            JdbcBatchItemWriter<Preference> preferenceItemWriter) {
//        this.transactionManager = transactionManager;
//        this.jobRepository = jobRepository;
//        this.preferenceItemReader = preferenceItemReader;
//        this.preferenceItemWriter = preferenceItemWriter;
//    }
//
//    @Bean
//    public Job preferenceBatchJob() {
//        try {
//            log.debug("Preference Batch Job 생성 시작");
//            return new JobBuilder("PreferenceBatchJob", jobRepository)
//                    .start(preferenceStep())
//                    .build();
//        } catch (Exception e) {
//            log.error("배치 Job 생성 실패: {}", e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.JOB_CREATION_FAILED, e);
//        }
//    }
//
//    @Bean
//    public Step preferenceStep() {
//        try {
//            log.info("Preference Step 생성 시작");
//            return new StepBuilder("preferenceStep", jobRepository)
//                    .<Preference, Preference>chunk(10, transactionManager)
//                    .allowStartIfComplete(true)
//                    .reader(preferenceItemReader)
//                    .writer(preferenceItemWriter)
//                    .build();
//        } catch (Exception e) {
//            log.error("배치 Step 생성 실패: {}", e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.STEP_CREATION_FAILED, e);
//        }
//    }
//}
