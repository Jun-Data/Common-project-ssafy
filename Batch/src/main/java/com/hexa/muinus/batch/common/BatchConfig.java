package com.hexa.muinus.batch.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.JobRepositoryFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Slf4j
@Configuration
@EnableBatchProcessing(dataSourceRef = "dataDBSource")
public class BatchConfig {
    @Bean
    public JobRepository jobRepository(DataSource metaDBSource, PlatformTransactionManager transactionManager) throws Exception {
        JobRepositoryFactoryBean factory = new JobRepositoryFactoryBean();
        factory.setDataSource(metaDBSource);
        factory.setTransactionManager(transactionManager);
        factory.afterPropertiesSet();
        return factory.getObject();
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource metaDBSource) {
        return new DataSourceTransactionManager(metaDBSource);
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource metaDBSource) {
        return new JdbcTemplate(metaDBSource);
    }

}
