package com.hexa.muinus.batch.common;

import com.hexa.muinus.batch.exception.BatchErrorCode;
import com.hexa.muinus.batch.exception.BatchProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class MetaDBConfig {

    @Primary
    @Bean(name = "metaDBSource")
    @ConfigurationProperties(prefix = "spring.datasource-meta")
    public DataSource metaDBSource() {
        try {
            log.info("MetaDB DataSource 초기화 시작");
            return DataSourceBuilder.create().build();
        } catch (Exception e) {
            log.error("메타 데이터 DB 연결 실패: {}", e.getMessage());
            throw new BatchProcessingException(BatchErrorCode.DATABASE_CONNECTION_FAILED, e);
        }
    }

    @Primary
    @Bean(name = "metaTransactionManager")
    public PlatformTransactionManager metaTransactionManager(
            @Qualifier("metaDBSource") DataSource dataSource) {
        try {
            log.info("MetaDB TransactionManager 초기화 시작");
            return new DataSourceTransactionManager(dataSource);
        } catch (Exception e) {
            log.error("트랜잭션 매니저 초기화 실패: {}", e.getMessage());
            throw new BatchProcessingException(BatchErrorCode.TRANSACTION_MANAGER_INIT_FAILED, e);
        }
    }

    @Primary
    @Bean(name = "metaJdbcTemplate")
    public JdbcTemplate metaJdbcTemplate(@Qualifier("metaDBSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}

