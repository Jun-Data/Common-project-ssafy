package com.hexa.muinus.elasticsearch.service;

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

    // es 색인에 필요한 데이터 업데이트 후 app 재시작 시 es에 재로드
    private final ElasticsearchClient elasticsearchClient;
    private final String indexName = "items";

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            ReloadSearchAnalyzersResponse response = elasticsearchClient.indices()
                    .reloadSearchAnalyzers(r -> r.index(indexName));
            // 만약 acknowledged() 메서드가 없다면, 예외 없이 호출 완료되면 성공으로 간주
            log.info("Search analyzers reloaded successfully for index: {}", indexName);
        } catch (Exception e) {
            log.error("Failed to reload search analyzers for index: {}", indexName);
            e.printStackTrace();
        }
    }
}
