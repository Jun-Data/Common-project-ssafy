package com.hexa.muinus.elasticsearch.service;

import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.dto.PreferTrends;
import com.hexa.muinus.users.domain.preference.repository.PreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.index.Terms;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimpleRecommandService {
    private final ItemAnalyzer itemAnalyzer;
    private final PreferenceRepository preferenceRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    private static final String INDEX = "items";
    private static final String ANALYZER = "custom_analyzer";
    private static final String NAME_SEARCH_FILED = "item_name.nori";

    public List<ESItem> getRecommendedItems(String userEmail) {
        log.info("getRecommendedItems userEmail:{}", userEmail);

        List<PreferTrends> preferTrends =  preferenceRepository.findItemsByScore(userEmail, LocalDate.now()).stream()
                                    .map(PreferTrends::new)
                                    .toList();

        HashMap<String, Float> tokenScores = extractKeywordScores(preferTrends);
        NativeQuery query = createNativeQueryForRecommand(tokenScores, preferenceRepository.getRecentItems(userEmail, LocalDate.now().minusDays(7)));
        log.info("query: {}", query.getQuery());

        SearchHits<ESItem> searchHits = elasticsearchOperations.search(query, ESItem.class, IndexCoordinates.of("items"));
        searchHits.getSearchHits();

        countingHitTokens(searchHits.getSearchHits(), tokenScores);
        log.info("getRecommendedItems preferTrends:{}", preferTrends);



        return null;
    }


    public void countingHitTokens(List<SearchHit<ESItem>> hits, HashMap<String, Float> tokenScores) {
        log.debug("countingHitTokens hits:{}", hits);
        if(hits.isEmpty()) return ;

        Set<String> tokens = tokenScores.keySet();

        for(SearchHit<ESItem> hit : hits) {
            int count = 0;
            for(String keyword : itemAnalyzer.getAnalyzedTokens(hit.getContent().getItemName(), INDEX, ANALYZER)){
                if(tokens.contains(keyword)){
                    count++;
                }
            }
//            hit.getScore()/count
        }

    }



    /**
     * 각 아이템마다 키워드(토큰) 추출 -> 전체 아이템에서 각 키워드가 얼마나 등장하는지 카운팅 * 점수
     * @param preferItems
     * @return HashMap<String, Double> 키워드(토큰)별 점수
     */
    private HashMap<String, Float> extractKeywordScores(List<PreferTrends> preferItems) {
        HashMap<String, Float> tokenScores = new HashMap<>();

        for (PreferTrends item : preferItems) {
            List<String> tokens = itemAnalyzer.getAnalyzedTokens(
                    item.getItemName(), "items", "custom_analyzer");

            log.info("tokens:{}", tokens);

            Float itemScore = item.getTrendRating() * item.getPurchaseCount();
            for (String token : tokens) {
                tokenScores.merge(token, itemScore, Float::sum);
            }
        }
        log.info("tokenScores:{}", tokenScores);
        return tokenScores;
    }

    private NativeQuery createNativeQueryForRecommand(HashMap<String, Float> tokenScores, List<Integer> itemIds) {
        return new NativeQueryBuilder()
                .withQuery(q -> q .bool(b -> {
                    tokenScores.forEach((k, v) -> {
                        b.should(s -> s.constantScore(QueryCreator.buildConstantScoreQuery(NAME_SEARCH_FILED, k, v)));
                    });

                    if (itemIds != null && !itemIds.isEmpty()) {
                        b.mustNot(m -> m.terms(t -> QueryCreator.buildTermsQuery("item_id", itemIds).apply(t)));
                    }
                    b.minimumShouldMatch("1");
                    return b;
                }))
                .build();
    }

}
