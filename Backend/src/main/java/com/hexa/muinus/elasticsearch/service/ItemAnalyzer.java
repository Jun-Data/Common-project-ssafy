package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.AnalyzeRequest;
import co.elastic.clients.elasticsearch.indices.AnalyzeResponse;
import co.elastic.clients.elasticsearch.indices.analyze.AnalyzeToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemAnalyzer {

    private final ElasticsearchClient elasticsearchClient;

    /**
     * 분석 결과 - 토큰 받아오기
     * @param query
     * @param index
     * @param analyzer
     * @return
     */
    public List<String> getAnalyzedTokens(String query, String index, String analyzer) {
        try {
            AnalyzeRequest request = AnalyzeRequest.of(a -> a
                    .index(index)                           // 인덱스 지정
                    .analyzer(analyzer)       // 사용할 analyzer 지정
                    .text(query.toLowerCase())
            );

            AnalyzeResponse response = elasticsearchClient.indices().analyze(request);
            List<AnalyzeToken> analyzeTokens = response.tokens();

            return analyzeTokens.stream().map(AnalyzeToken::token).toList();

        } catch (IOException e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
