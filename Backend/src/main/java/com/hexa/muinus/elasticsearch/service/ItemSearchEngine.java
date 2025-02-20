package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.hexa.muinus.common.exception.ESErrorCode;
import com.hexa.muinus.common.exception.MuinusException;
import com.hexa.muinus.elasticsearch.config.KeywordDataLoader;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.dto.SearchNativeDTO;
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

@Slf4j
@Service
public class ItemSearchEngine {

    private final ElasticsearchOperations elasticsearchOperations;
    private final ItemAnalyzer esAnalyzer;

    private static Set<String> TYPE_KEYWORDS;
    private static Set<String> BRAND_KEYWORDS;

    private final static Float MAIN_SCORE = 5.0F;
    private final static Float TYPE_SCORE = 2.0F;
    private final static Float BRAND_SCORE = 1.0F;

    public ItemSearchEngine(ElasticsearchOperations elasticsearchOperations, ItemAnalyzer esAnalyzer) {
        this.elasticsearchOperations = elasticsearchOperations;
        this.esAnalyzer = esAnalyzer;
        TYPE_KEYWORDS = KeywordDataLoader.getTypeKeywords();
        BRAND_KEYWORDS = KeywordDataLoader.getBrandKeywords();
    }

    public List<ESItem> searchByQuery(SearchNativeDTO dto) {
        String query = dto.getQuery();

        List<String> tokens = esAnalyzer.getAnalyzedTokens(query, "items", "custom_analyzer");
        log.debug("tokens: {}", tokens);

        if(tokens.isEmpty()){
            return List.of();
        }

        try {
            List<ESItem> items = searchNoriOperation(tokens, "item_name.nori", dto);
            log.debug("nori - items: {}", items);
            if(items.isEmpty()){
                items = searchNoriOperation(tokens, "item_name.nori_shingle", dto);
                log.debug("shingle - items: {}", items);
            }
            return items;

        } catch (Exception e) {
            e.printStackTrace();
            throw new MuinusException(ESErrorCode.ES_QUERY_ERROR, "Elasticsearch 검색 중 오류 발생");
        }
    }

    private List<ESItem> shuffleSameScore(List<SearchHit<ESItem>> hits) {
        log.info(hits.toString());
        if(hits.isEmpty()) return List.of();

        log.debug("before shuffle - hits: {}", hits);
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

        //return finalItemList.subList(0, Math.min(finalItemList.size(), 6));
        return finalItemList;
    }

    public List<ESItem> searchNoriOperation(List<String> tokens, String field, SearchNativeDTO condition) throws IOException {
        NativeQuery query = createNativeQueryForSearch(tokens, field, condition);
        log.info("query: {}", query.getQuery());
        SearchHits<ESItem> hits = elasticsearchOperations.search(query, ESItem.class, IndexCoordinates.of("items"));

        return shuffleSameScore(hits.getSearchHits());
    }

    private List<ESItem> extractSearchResults(SearchHits<ESItem> searchHits) {
        List<ESItem> resultList = new ArrayList<>();
        for (SearchHit<ESItem> hit : searchHits.getSearchHits()) {
            resultList.add(hit.getContent());
        }
        return resultList;
    }

    public NativeQuery createNativeQueryForSearch(List<String> tokens, String field, SearchNativeDTO condition) {
        return new NativeQueryBuilder()
                .withQuery(q -> q.bool(b -> {
                    tokens.forEach(token -> {
                        float boost = TYPE_KEYWORDS.contains(token)
                                ? TYPE_SCORE
                                : BRAND_KEYWORDS.contains(token)
                                ? BRAND_SCORE
                                : MAIN_SCORE;

                        // 원본 매칭 1.5배
                        b.should(s -> s.constantScore(QueryCreator.buildFuzzyMatchQuery(field, token, boost * 1.5F))); // 정확 일치 시 더 높은 점수

                        // 동의어 매칭
                        b.should(s -> s.constantScore(QueryCreator.buildFuzzySynonymMatchQuery(field, token, boost)));



                    });

                    b.filter(f -> f.range(QueryCreator.buildRangeFilter("sugars", condition.getMinSugar(), condition.getMaxSugar())));
                    b.filter(f -> f.range(QueryCreator.buildRangeFilter("calories", condition.getMinCal(), condition.getMaxCal())));

                    b.minimumShouldMatch("1");
                    return b;
                }))
                .withSort(QueryCreator.buildScoreSort())
                .build();
    }

}

