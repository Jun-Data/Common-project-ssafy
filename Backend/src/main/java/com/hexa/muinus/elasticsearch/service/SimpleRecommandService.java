package com.hexa.muinus.elasticsearch.service;

import com.hexa.muinus.store.domain.item.Item;
import com.hexa.muinus.users.domain.preference.repository.PreferenceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SimpleRecommandService {
    private ItemAnalyzer itemAnalyzer;
    private PreferenceRepository preferenceRepository;

    // 로그인만
    public List<Item> getRecommendedItems(String userEmail) {
        log.info("getRecommendedItems userEmail:{}", userEmail);
        List<String> eatenItemsforMonth = preferenceRepository.findItemsByScore(userEmail, LocalDate.now());

        // 토큰(키워드) 별 등장 횟수
        Map<String, Integer> tokenCount = extractFrequency(eatenItemsforMonth);
        itemAnalyzer.getAnalyzedTokens("item_name.nori", "items", "");
        return null;
    }

    /**
     * 각 아이템마다 키워드(토큰) 추출 -> 전체 아이템에서 각 키워드가 얼마나 등장하는지 카운팅
     * @param queryList
     * @return
     */
    public Map<String, Integer> extractFrequency(List<String> queryList) {
        Map<String, Integer> tokenCount = new HashMap<>();
        LocalDate today = LocalDate.now();
        return queryList.stream()
                .flatMap(query -> preferenceRepository.findItemsByScore(query, today).stream())
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        Collectors.summingInt(token -> 1)
                ));
    }
}
