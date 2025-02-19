package com.hexa.muinus.elasticsearch.service;

import com.hexa.muinus.elasticsearch.config.KeywordDataLoader;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.dto.PreferTrends;
import com.hexa.muinus.users.domain.preference.repository.PreferenceRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SimpleRecommandService {
    private final ItemAnalyzer itemAnalyzer;
    private final PreferenceRepository preferenceRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    private static Set<String> TYPE_KEYWORDS;
    private static Set<String> BRAND_KEYWORDS;

    private static final String INDEX = "items";
    private static final String ANALYZER = "custom_analyzer";
    private static final String NAME_SEARCH_FILED = "item_name.nori";

    public SimpleRecommandService(ItemAnalyzer itemAnalyzer,
                                  PreferenceRepository preferenceRepository,
                                  ElasticsearchOperations elasticsearchOperations) {
        this.itemAnalyzer = itemAnalyzer;
        this.preferenceRepository = preferenceRepository;
        this.elasticsearchOperations = elasticsearchOperations;

        TYPE_KEYWORDS = KeywordDataLoader.getTypeKeywords();
        BRAND_KEYWORDS = KeywordDataLoader.getBrandKeywords();
    }

    public List<ESItem> getRecommendedItems(String userEmail) {
        log.debug("getRecommendedItems userEmail:{}", userEmail);

        List<PreferTrends> preferTrends =  preferenceRepository.findItemsByScore(userEmail, LocalDate.now().minusDays(1)).stream()
                                    .map(PreferTrends::new)
                                    .toList();
        log.debug("preferTrends:{}", preferTrends);
        List<TokenScore> tokenScores = extractKeywordScores(preferTrends);

        // 상하 20% 잘라내고 중간 토큰 사용
        List<TokenScore> finalTokenScores;
        if (tokenScores.size() < 3) {
            finalTokenScores = tokenScores;
        } else {
            Collections.sort(tokenScores); // 점수순
            int size = tokenScores.size();
            int removeCount = (int) Math.round(size * 0.20);
            finalTokenScores = tokenScores.subList(removeCount, size - removeCount);
        }

        NativeQuery query = createNativeQueryForRecommand(finalTokenScores, preferenceRepository.getRecentItems(userEmail, LocalDate.now().minusDays(7)));
        log.debug("query: {}", query.getQuery());

        SearchHits<ESItem> searchHits = elasticsearchOperations.search(query, ESItem.class, IndexCoordinates.of("items"));
        searchHits.getSearchHits();

        List<ESItem> hitItems = countingHitTokens(searchHits.getSearchHits(), finalTokenScores);
        log.debug("hitItems:{}", hitItems);

        return selectRecommendItems(hitItems);
    }

    public List<ESItem> selectRecommendItems(List<ESItem> candidates) {
        List<ESItem> selectedRecommendations = new ArrayList<>();

        if (candidates == null || candidates.isEmpty()) {
            return selectedRecommendations;
        }

        int totalCandidates = candidates.size();

        // 11개 이하면 거기서 5개
        if (totalCandidates < 12) {
            List<ESItem> shuffled = new ArrayList<>(candidates);
            Collections.shuffle(shuffled);
            int count = Math.min(5, shuffled.size());
            selectedRecommendations.addAll(shuffled.subList(0, count));
            return selectedRecommendations;
        } else {
            // 후보가 12개 이상인 경우:
            // 상위 - 정렬된 순서의 처음 10개
            List<ESItem> topGroup = new ArrayList<>(candidates.subList(0, 10));
            // 하위 -  상위 10개 이후 최대 10개 (만약 전체 후보가 20개 미만이면 남은 후보 모두)
            int bottomStart = 10;
            int bottomEnd = Math.min(bottomStart + 10, totalCandidates);
            List<ESItem> bottomGroup = new ArrayList<>(candidates.subList(bottomStart, bottomEnd));

            Collections.shuffle(topGroup);
            Collections.shuffle(bottomGroup);

            // 상위에서 3개 선택
            int countTop = Math.min(3, topGroup.size());
            selectedRecommendations.addAll(topGroup.subList(0, countTop));

            // 하위에서 2개 선택
            int countBottom = Math.min(2, bottomGroup.size());
            selectedRecommendations.addAll(bottomGroup.subList(0, countBottom));

            return selectedRecommendations;
        }
    }


    public List<ESItem> countingHitTokens(List<SearchHit<ESItem>> hits, List<TokenScore> tokenScores) {
        log.debug("countingHitTokens hits:{}", hits);
        if(hits.isEmpty()) return null;
        
        List<ItemScore> hitList = new ArrayList<>(); // String itemName으로 사용

        Set<String> tokens = tokenScores.stream()
                .map(TokenScore::getToken)
                .collect(Collectors.toSet());

        for(SearchHit<ESItem> hit : hits) {
            int count = 0;
            ESItem item = hit.getContent();
            for(String keyword : itemAnalyzer.getAnalyzedTokens(item.getItemName(), INDEX, ANALYZER)){
                if(tokens.contains(keyword)){
                    count++;
                }
            }
            float score = hit.getScore() / count;
            hitList.add(new ItemScore(item, score));
            log.debug("{}({}) : {}", item, count, score );
        }

        Collections.sort(hitList);
        return hitList.stream()
                .map(ItemScore::getItem)
                .toList();
    }



    /**
     * 각 아이템마다 키워드(토큰) 추출 -> 전체 아이템에서 각 키워드가 얼마나 등장하는지 카운팅 * 점수
     * @param preferItems
     * @return HashMap<String, Double> 키워드(토큰)별 점수
     */
    private List<TokenScore> extractKeywordScores(List<PreferTrends> preferItems) {
        HashMap<String, Float> tokenScoreMap = new HashMap<>();

        for (PreferTrends item : preferItems) {
            List<String> tokens = itemAnalyzer.getAnalyzedTokens(item.getItemName(), "items", "custom_analyzer");

            log.info("tokens:{}", tokens);

            Float itemScore = item.getTrendRating() * item.getPurchaseCount();
            for (String token : tokens) {
                if(!BRAND_KEYWORDS.contains(token)){ // 브랜드 키워드 뺌
                    tokenScoreMap.merge(token, itemScore, Float::sum);    
                }
            }
        }
        log.info("tokenScoreMap:{}", tokenScoreMap);

        List<TokenScore> tokenScores = new ArrayList<>(
                tokenScoreMap.entrySet().stream()
                .map(e -> new TokenScore(e.getKey(), e.getValue()))
                .toList()
        );

        log.info("tokenScores List: {}", tokenScores);
        return tokenScores;
    }

    private NativeQuery createNativeQueryForRecommand(List<TokenScore> tokenScores, List<Integer> itemIds) {
        return new NativeQueryBuilder()
                .withQuery(q -> q .bool(b -> {
                    tokenScores.forEach(t -> {
                        b.should(s -> s.constantScore(QueryCreator.buildConstantScoreQuery(NAME_SEARCH_FILED, t.token, t.score)));
                    });

                    if (itemIds != null && !itemIds.isEmpty()) {
                        b.mustNot(m -> m.terms(t -> QueryCreator.buildTermsQuery("item_id", itemIds).apply(t)));
                    }
                    b.minimumShouldMatch("1");
                    return b;
                }))
                .build();
    }

    @Getter
    public class TokenScore  implements Comparable<TokenScore> {
        private String token;
        private float score;

        public TokenScore(String token, float score) {
            this.token = token;
            this.score = score;
        }

        // 내림차순
        @Override
        public int compareTo(TokenScore other) {
            return Float.compare(other.score, this.score);
        }
    }

    @Getter
    public class ItemScore implements Comparable<ItemScore> {
        private ESItem item;
        private float score;

        public ItemScore(ESItem item, float score) {
            this.item = item;
            this.score = score;
        }

        // 내림차순
        @Override
        public int compareTo(ItemScore other) {
            return Float.compare(other.score, this.score);
        }
    }

}
