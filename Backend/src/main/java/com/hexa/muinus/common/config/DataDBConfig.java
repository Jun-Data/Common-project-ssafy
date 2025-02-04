package com.hexa.muinus.common.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;

@Configuration
@EnableJpaRepositories(
        basePackages = {"com.hexa.muinus.store", "com.hexa.muinus.users"},
        entityManagerFactoryRef = "dataEntityManager",
        transactionManagerRef = "dataTransactionManager"
)
public class DataDBConfig {

    @Primary
    @Bean(name = "dataDBSource")
    @ConfigurationProperties(prefix = "spring.datasource-data")
    public DataSource dataDBSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "dataTransactionManager")
    public PlatformTransactionManager dataTransactionManager(
            @Qualifier("dataDBSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Primary
    @Bean(name = "dataEntityManager")
    public LocalContainerEntityManagerFactoryBean dataEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("dataDBSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.hexa.muinus.store", "com.hexa.muinus.users") // ✅ 운영 DB 관련 엔티티 패키지
                .persistenceUnit("data")
                .build();
    }
}