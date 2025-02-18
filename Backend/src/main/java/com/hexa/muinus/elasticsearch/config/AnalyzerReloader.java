package com.hexa.muinus.elasticsearch.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.ReloadSearchAnalyzersResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyzerReloader implements ApplicationRunner {

    private final ElasticsearchClient elasticsearchClient;
    private final String indexName = "items";

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            ReloadSearchAnalyzersResponse response = elasticsearchClient.indices()
                    .reloadSearchAnalyzers(r -> r.index(indexName));
            log.info("Search analyzers reloaded successfully for index: {}", indexName);
        } catch (Exception e) {
            log.error("Failed to reload search analyzers for index: {}", indexName);
            e.printStackTrace();
        }
    }
}
