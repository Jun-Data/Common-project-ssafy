package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch._types.GeoLocation;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.domain.ESStoreItem;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.DistanceUnit;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.GeoDistanceQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ESItemService {

    // 기존 Spring Data Elasticsearch를 이용한 작업에 사용
    private final ElasticsearchOperations elasticsearchOperations;

    // Elasticsearch Java Client (elasticsearch-java) 주입
    private final ElasticsearchClient elasticsearchClient;

    /**
     * 1) prefix query 로 5개 itemName 추천
     * - "item_name" 필드가 입력한 prefix로 시작하는 ESItem을 검색합니다.
     */
    public List<ESItem> autocompleteItemName(String prefix) {
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
     * - 주어진 itemId와 기준 위치(lat, lon)를 이용해 store_items 인덱스에서 검색하며,
     *   기준 위치와의 거리에 따라 오름차순 정렬 후 각 ESStoreItem에 distance 값을 할당합니다.
     */
    public List<ESStoreItem> searchStoreItemsByRange(Integer itemId, double lat, double lon) throws IOException {
        // Geo Distance Query 생성 (1km 반경)
        Query geoQuery = Query.of(q -> q
                .geoDistance(GeoDistanceQuery.of(g -> g
                        .field("location")
                        .distance("1km")
                        .location(GeoLocation.of(o -> o.latlon(b -> b.lat(lat).lon(lon))))
                ))
        );

        // Elasticsearch 검색 요청 생성 (인라인 빌더 방식으로 geo distance 정렬 추가)
        SearchRequest searchRequest = SearchRequest.of(s -> s
                .index("store_items")
                .query(q -> q.bool(b -> b.must(
                        Query.of(qb -> qb.term(t -> t.field("item_id").value(itemId))),
                        geoQuery
                )))
                .sort(so -> so.geoDistance(g -> g
                        .field("location")
                        .location(GeoLocation.of(o -> o.latlon(b -> b.lat(lat).lon(lon))))
                        .unit(DistanceUnit.Meters)
                        .order(SortOrder.Asc)
                ))
        );

        // Elasticsearch 검색 실행
        SearchResponse<ESStoreItem> response = elasticsearchClient.search(searchRequest, ESStoreItem.class);

        // 검색 결과 처리 및 반환 (정렬 값에서 distance 추출)
        return response.hits().hits().stream()
                .map(hit -> {
                    ESStoreItem item = hit.source();
                    if (item != null && hit.sort() != null && !hit.sort().isEmpty()) {
                        String sortValue = hit.sort().get(0).toString();
                        item.setDistance(Double.parseDouble(sortValue));
                    }
                    return item;
                })
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
