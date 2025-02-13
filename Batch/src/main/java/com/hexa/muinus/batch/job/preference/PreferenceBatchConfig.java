package com.hexa.muinus.batch.job.preference;

import com.hexa.muinus.batch.domain.Preference;
import com.hexa.muinus.batch.exception.BatchErrorCode;
import com.hexa.muinus.batch.exception.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.ItemWriteListener;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

@Slf4j
@Configuration
@EnableBatchProcessing(dataSourceRef = "dataDBSource", transactionManagerRef = "metaTransactionManager")
public class PreferenceBatchConfig {

    private final PlatformTransactionManager transactionManager;
    private final JobRepository jobRepository;
    private final PreferenceItemReader preferenceItemReader;
    private final JdbcBatchItemWriter<Preference> preferenceItemWriter;

    public PreferenceBatchConfig(
            @Qualifier("metaTransactionManager") PlatformTransactionManager transactionManager,
            @Qualifier("jobRepository") JobRepository jobRepository,
            PreferenceItemReader preferenceItemReader,
            JdbcBatchItemWriter<Preference> preferenceItemWriter) {
        this.transactionManager = transactionManager;
        this.jobRepository = jobRepository;
        this.preferenceItemReader = preferenceItemReader;
        this.preferenceItemWriter = preferenceItemWriter;
    }

    @Bean
    public Job preferenceBatchJob() {
        try {
            log.info("Preference Batch Job 생성 시작");
            return new JobBuilder("PreferenceBatchJob", jobRepository)
                    .start(preferenceStep())
                    .incrementer(new RunIdIncrementer())
                    .build();
        } catch (Exception e) {
            log.error("배치 Job 생성 실패: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.JOB_CREATION_FAILED, e);
        }
    }

    @Bean
    public Step preferenceStep() {
        try {
            log.info("Preference Step 생성 시작");
            return new StepBuilder("preferenceStep", jobRepository)
                    .<Preference, Preference>chunk(100, transactionManager)
                    .allowStartIfComplete(false)
                    .reader(preferenceItemReader)
                    .writer(preferenceItemWriter)
                    .listener(new ItemWriteListener<Preference>() {
                        public void beforeWrite(List<? extends Preference> items) {
                            log.info("Writing {} preferences to DB", items.size());
                        }

                        public void afterWrite(List<? extends Preference> items) {
                            log.info("Successfully wrote {} preferences to DB", items.size());
                        }

                        public void onWriteError(Exception exception, List<? extends Preference> items) {
                            log.error("배치 쓰기 오류 발생: {}", exception.getMessage());
                            log.error("문제 발생한 데이터: {}", items);
                            // 여기에 Slack 또는 이메일 알림 로직 추가 가능
                        }
                    })
                    .build();
        } catch (Exception e) {
            log.error("배치 Step 생성 실패: {}", e.getMessage(), e);
            throw new BatchProcessingException(BatchErrorCode.STEP_CREATION_FAILED, e);
        }
    }
}
