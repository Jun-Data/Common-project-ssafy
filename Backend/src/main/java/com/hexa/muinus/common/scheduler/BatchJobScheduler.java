package com.hexa.muinus.common.scheduler;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

@Component
public class BatchJobScheduler {

    @Autowired
    @Qualifier("metaDBSource")
    private DataSource metaDBSource;

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job dailySalesJob;

    // 매일 자정 30초에 실행 (00:00:30)
    @Scheduled(cron = "30 0 0 * * ?")
    public void runBatchJobAtMidnight5() throws Exception {
        jobLauncher.run(dailySalesJob, new JobParameters());
    }
}