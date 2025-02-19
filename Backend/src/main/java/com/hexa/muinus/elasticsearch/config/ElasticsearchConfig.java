package com.hexa.muinus.elasticsearch.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.support.GenericConversionService;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchConverter;
import org.springframework.data.elasticsearch.core.convert.MappingElasticsearchConverter;
import org.springframework.data.elasticsearch.core.mapping.SimpleElasticsearchMappingContext;

@Configuration
public class ElasticsearchConfig {

    @Value("${spring.elasticsearch.rest.uris}")
    private String esUri;

    @Value("${spring.elasticsearch.rest.username:}")
    private String username;

    @Value("${spring.elasticsearch.rest.password:}")
    private String password;

    /**
     * RestClient 생성 - 인증정보가 있으면 Basic 인증 적용
     */
    @Bean
    public RestClient restClient() {
        RestClientBuilder builder = RestClient.builder(HttpHost.create(esUri));
        if (username != null && !username.isEmpty()) {
            BasicCredentialsProvider credsProvider = new BasicCredentialsProvider();
            credsProvider.setCredentials(AuthScope.ANY,
                    new UsernamePasswordCredentials(username, password));
            builder.setHttpClientConfigCallback(
                    httpClientBuilder -> httpClientBuilder.setDefaultCredentialsProvider(credsProvider)
            );
        }
        return builder.build();
    }

    /**
     * ElasticsearchClient 생성 - 커스터마이징된 ObjectMapper를 사용하여 JacksonJsonpMapper 적용
     */
    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        ObjectMapper objectMapper = new ObjectMapper();
        // JavaTimeModule 등록 (Java 8 날짜/시간 지원)
        objectMapper.registerModule(new JavaTimeModule());
        // Elasticsearch가 반환하는 스네이크 케이스 JSON을 도메인 클래스의 카멜 케이스와 매핑
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

        JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper(objectMapper);
        RestClientTransport transport = new RestClientTransport(restClient, jsonpMapper);
        return new ElasticsearchClient(transport);
    }

    /**
     * 도메인-문서 매핑을 위한 MappingContext 생성
     */
    @Bean
    public SimpleElasticsearchMappingContext mappingContext() {
        return new SimpleElasticsearchMappingContext();
    }

    /**
     * ElasticsearchConverter 생성 - 도메인 객체와 Elasticsearch 문서 간의 변환 지원
     */
    @Bean
    public ElasticsearchConverter elasticsearchConverter(SimpleElasticsearchMappingContext mappingContext) {
        return new MappingElasticsearchConverter(mappingContext);
    }

    @Bean
    public GenericConversionService conversionService() {
        GenericConversionService conversionService = new GenericConversionService();
        conversionService.addConverter(new StringToLocalDateTimeConverter());
        return conversionService;
    }

    /**
     * ElasticsearchOperations 빈 생성 - ElasticsearchTemplate 사용 (org.springframework.data.elasticsearch.client.elc)
     */
    @Bean("elasticsearchTemplate")
    public ElasticsearchOperations elasticsearchOperations(ElasticsearchClient client, ElasticsearchConverter converter) {
        return new ElasticsearchTemplate(client, converter);
    }
}
