package com.hexa.muinus.elasticsearch.service;

import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.domain.ESStoreItem;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ESItemService {

    private final ElasticsearchOperations elasticsearchOperations;

    /**
     * 1) prefix query 로 5개 itemName 추천
     * - "item_name" 필드가 입력한 prefix로 시작하는 ESItem을 검색합니다.
     */
    public List<ESItem> autocompleteItemName(String prefix) {
        // Criteria를 이용하여 "item_name" 필드가 prefix로 시작하는 조건 생성
        Criteria criteria = new Criteria("item_name").startsWith(prefix);
        CriteriaQuery query = new CriteriaQuery(criteria);
        query.setPageable(PageRequest.of(0, 7));  // 상위 5개만 검색

        SearchHits<ESItem> searchHits = elasticsearchOperations.search(query, ESItem.class);
        return searchHits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    /**
     * 2) 당(sugars)과 칼로리(calories) 범위 검색
     * - 지정한 범위 내의 ESItem을 검색합니다.
     */
    public List<ESItem> searchBySugarAndCalorieRange(Integer minSugar,
                                                     Integer maxSugar,
                                                     Integer minCal,
                                                     Integer maxCal) {
        Criteria criteria = new Criteria();

        // sugars 범위 조건
        if (minSugar != null || maxSugar != null) {
            Criteria sugarCriteria = new Criteria("sugars");
            if (minSugar != null) {
                sugarCriteria = sugarCriteria.greaterThanEqual(minSugar);
            }
            if (maxSugar != null) {
                sugarCriteria = sugarCriteria.lessThanEqual(maxSugar);
            }
            criteria = criteria.and(sugarCriteria);
        }

        // calories 범위 조건
        if (minCal != null || maxCal != null) {
            Criteria calorieCriteria = new Criteria("calories");
            if (minCal != null) {
                calorieCriteria = calorieCriteria.greaterThanEqual(minCal);
            }
            if (maxCal != null) {
                calorieCriteria = calorieCriteria.lessThanEqual(maxCal);
            }
            criteria = criteria.and(calorieCriteria);
        }

        CriteriaQuery query = new CriteriaQuery(criteria);
        SearchHits<ESItem> searchHits = elasticsearchOperations.search(query, ESItem.class);
        return searchHits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    /**
     * 3) 지정 위치 근처 매장 검색 (대략 1km 반경)
     * - 주어진 itemId와 위도/경도 범위에 해당하는 ESStoreItem을 검색합니다.
     */
    public List<ESStoreItem> searchStoreItemsByRange(Integer itemId, double lat, double lon) {
        double delta = 0.01; // 대략 1km 반경 (예시 값)
        Criteria criteria = new Criteria("item_id").is(itemId)
                .and(new Criteria("lat").greaterThanEqual(lat - delta)
                        .lessThanEqual(lat + delta))
                .and(new Criteria("lon").greaterThanEqual(lon - delta)
                        .lessThanEqual(lon + delta));
        CriteriaQuery query = new CriteriaQuery(criteria);
        SearchHits<ESStoreItem> searchHits = elasticsearchOperations.search(query, ESStoreItem.class);
        return searchHits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    /**
     * 현 위치 근처의 매장 탐색
     * @param lat
     * @param lon
     * @return
     */
    public List<ESStoreItem> searchStoreByRange(double lat, double lon) {
        double delta = 0.01; // 대략 1km 반경 (예시 값)
        Criteria criteria = new Criteria("lat").greaterThanEqual(lat - delta)
                .lessThanEqual(lat + delta)
                .and(new Criteria("lon").greaterThanEqual(lon - delta)
                        .lessThanEqual(lon + delta));
        CriteriaQuery query = new CriteriaQuery(criteria);
        SearchHits<ESStoreItem> searchHits = elasticsearchOperations.search(query, ESStoreItem.class);
        return searchHits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }
}
