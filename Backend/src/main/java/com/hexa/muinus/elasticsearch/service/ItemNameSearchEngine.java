package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.ConstantScoreQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.RangeQuery;
import co.elastic.clients.elasticsearch.indices.AnalyzeRequest;
import co.elastic.clients.elasticsearch.indices.AnalyzeResponse;
import co.elastic.clients.elasticsearch.indices.analyze.AnalyzeToken;
import co.elastic.clients.util.ObjectBuilder;
import com.hexa.muinus.common.exception.ESErrorCode;
import com.hexa.muinus.common.exception.MuinusException;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.dto.SearchNativeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemNameSearchEngine {

    private final ElasticsearchOperations elasticsearchOperations;
    private final ElasticsearchClient elasticsearchClient;

    private final static Set<String> SUB_KEYWORDS = Set.of("케이크", "케익", "콘", "바");
    private final static Float MAIN_SCORE = 5.0F;
    private final static Float SUB_SCORE = 2.0F;

    public List<ESItem> searchByQuery(SearchNativeDTO dto) {
        String query = dto.getQuery();

        List<String> tokens = getTokens(query, "items", "custom_search_analyzer");
        log.info("tokens: {}", tokens);
        if(tokens.isEmpty()){
            return List.of();
        }

        try {
            List<ESItem> items = searchNoriOperation(tokens, "item_name.nori", dto);
            log.info("nori - items: {}", items);
            if(!items.isEmpty()){
                items = searchNoriOperation(tokens, "item_name.nori_shingle", dto);
                log.info("shingle - items: {}", items);
            }
            return items;

        } catch (Exception e) {
            e.printStackTrace();
            throw new MuinusException(ESErrorCode.ES_QUERY_ERROR, "Elasticsearch 검색 중 오류 발생");
        }
    }

    private List<ESItem> shuffleSameScore(List<SearchHit<ESItem>> hits) {
        if(hits.isEmpty()) return List.of();

        log.info("before shuffle - hits: {}", hits);
        List<ESItem> finalItemList = new ArrayList<>();
        List<ESItem> sameScoreItemList = new ArrayList<>();

        // 체크 중인 점수 (높은 것에서 시작)
        double currentScore = hits.get(0).getScore();
        sameScoreItemList.add(hits.get(0).getContent());

        log.debug("hit: {}", hits.get(0).getScore());
        log.debug("hitItem: {}", hits.get(0).getContent());

        for(int i=1; i<hits.size(); i++){
            SearchHit<ESItem> hit = hits.get(i);
            double score = hit.getScore();

            log.debug("hit: {}", hit);
            log.debug("hitItem: {}", hit.getContent());

            if (Double.compare(score, currentScore) == 0) {
                // 현재 그룹과 점수가 동일하면 그룹에 추가
                sameScoreItemList.add(hit.getContent());
            } else {
                // 낮아졌으면 셔플해서 fianllist에 추가하고
                Collections.shuffle(sameScoreItemList);
                finalItemList.addAll(sameScoreItemList);
                // 새 그룹 설정
                sameScoreItemList.clear();
                currentScore = score;
                sameScoreItemList.add(hit.getContent());
            }
        }

        // 담아뒀던 마지막 리스트
        if(!sameScoreItemList.isEmpty()){
            Collections.shuffle(sameScoreItemList);
            finalItemList.addAll(sameScoreItemList);
        }
        return finalItemList;
    }

    private Function<ConstantScoreQuery.Builder, ObjectBuilder<ConstantScoreQuery>> buildConstantScoreQuery(String field, String text, float boost) {
        return csq -> csq
                .filter(f -> f.match(m -> m.field(field).query(text)))
                .boost(boost);
    }

    private Function<RangeQuery.Builder, ObjectBuilder<RangeQuery>> buildRangeFilter(String field, double min, double max) {

        return r -> r.number(rn -> rn.field(field).gte(min).lte(max));
    }


    public List<ESItem> searchNoriOperation(List<String> tokens, String field, SearchNativeDTO condition) throws IOException {
        NativeQuery query = createNativeQueryForSearch(tokens, field, condition);
        log.info("query: {}", query.getQuery().toString());
        SearchHits<ESItem> hits = elasticsearchOperations.search(query, ESItem.class, IndexCoordinates.of("items"));

        return shuffleSameScore(hits.getSearchHits());

    }

    public NativeQuery createNativeQueryForSearch(List<String> tokens,  String field, SearchNativeDTO condition){
        return new NativeQueryBuilder()
                .withQuery(q -> q.bool(b -> {
                    tokens.forEach(token -> {
                        float boost;
                        if(SUB_KEYWORDS.contains(token)) {
                            boost = SUB_SCORE;
                        } else {
                            boost = MAIN_SCORE;
                        }
                        b.should(s -> s.constantScore(buildConstantScoreQuery(field, token, boost)));
                    });

                    b.filter(f -> f.range(buildRangeFilter("sugars", condition.getMinSugar(), condition.getMaxSugar())));
                    b.filter(f -> f.range(buildRangeFilter("calories", condition.getMinCal(), condition.getMaxCal())));

                    // 최소 매치 수
                    b.minimumShouldMatch("1");
                    return b;
                }))
                .build();

    }



    public List<String> getTokens(String query, String index, String analyzer) {
        try {
            // 분석해서 토큰 먼저 얻기
            AnalyzeRequest request = AnalyzeRequest.of(a -> a
                    .index(index)                           // 인덱스 지정
                    .analyzer(analyzer)       // 사용할 analyzer 지정
                    .text(query)
            );

            // Analyze API 호출
            AnalyzeResponse response = elasticsearchClient.indices().analyze(request);
            List<AnalyzeToken> analyzeTokens = response.tokens();

            List<String> tokens = analyzeTokens.stream().map(AnalyzeToken::token).toList();
            return tokens;

        } catch (IOException e) {
            e.printStackTrace();
            return List.of();
        }
    }
}

