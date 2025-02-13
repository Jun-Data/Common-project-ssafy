package com.hexa.muinus.batch.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;

@Slf4j
@Component
public class BatchJobScheduler {

    private final JobLauncher jobLauncher;
    private final Job dailySalesJob;
    private final Job preferenceJob;

    public BatchJobScheduler(JobLauncher jobLauncher,
                             @Qualifier("dailySalesBatchJob") Job dailySalesJob,
                             @Qualifier("preferenceBatchJob") Job preferenceJob) {
        this.jobLauncher = jobLauncher;
        this.dailySalesJob = dailySalesJob;
        this.preferenceJob = preferenceJob;
    }

    /**
     * 매일 자정 실행
     */
    @Scheduled(cron = "55 2 13 * * ?")
    public void runBatchJobs() {
        log.info("배치 Job 실행 시작: {}", new Date());
        try {
            log.info("PreferenceJob 시작: {}", new Date());
            jobLauncher.run(preferenceJob, createJobParameters());

            log.info("DailySalesJob 시작: {}", new Date());
            jobLauncher.run(dailySalesJob, createJobParameters());

        } catch (Exception e) {
            log.error("배치 Job 실행 중 오류 발생: {}", e.getMessage(), e);
        }


        log.info("모든 배치 Job 순차 실행 완료: {}", new Date());
    }

    /**
     * Job 실행 메서드 (공통 처리)
     */
    private void runJob(Job job, String jobName) {
        try {
            log.info("{} 시작", jobName);
            jobLauncher.run(job, createJobParameters());
            log.info("{} 완료", jobName);
        } catch (Exception e) {
            log.error("{} 실행 실패: {}", jobName, e.getMessage(), e);
        }
    }

    /**
     * 매번 새로운 JobParameters 생성 (타임스탬프 추가)
     */
    private JobParameters createJobParameters() {
        return new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();
    }
}
