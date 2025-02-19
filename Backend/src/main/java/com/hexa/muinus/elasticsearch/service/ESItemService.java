package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.DistanceUnit;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.GeoDistanceQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch._types.GeoLocation;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.domain.ESStoreItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ESItemService {

    private final ElasticsearchClient elasticsearchClient;

    /**
     * 1) prefix query 로 5개 itemName 추천
     * - "item_name" 필드가 입력한 prefix로 시작하는 ESItem을 검색합니다.
     */
    public List<ESItem> autocompleteItemName(String prefix) throws IOException {
        SearchRequest request = SearchRequest.of(s -> s
                .index("items")
                .query(q -> q.prefix(p -> p.field("item_name").value(prefix)))
                .size(7)
        );
        SearchResponse<ESItem> response = elasticsearchClient.search(request, ESItem.class);
        return response.hits().hits().stream()
                .map(hit -> hit.source())
                .collect(Collectors.toList());
    }

    /**
     * 2) 당(sugars)과 칼로리(calories) 범위 검색
     * - 지정한 범위 내의 ESItem을 검색합니다.
     */
    public List<ESItem> searchBySugarAndCalorieRange(Integer minSugar,
                                                     Integer maxSugar,
                                                     Integer minCal,
                                                     Integer maxCal) throws IOException {
        return elasticsearchClient.search(SearchRequest.of(s -> s
                        .index("items")  // 실제 인덱스 이름으로 변경
                        .query(q -> q.bool(b -> {
                            // minSugar 조건 추가
                            if (minSugar != null) {
                                b.must(m -> m.range(r -> r
                                        .number(n -> n.field("sugars").gte(minSugar.doubleValue()))
                                ));
                            }
                            // maxSugar 조건 추가
                            if (maxSugar != null) {
                                b.must(m -> m.range(r -> r
                                        .number(n -> n.field("sugars").lte(maxSugar.doubleValue()))
                                ));
                            }
                            // minCal 조건 추가
                            if (minCal != null) {
                                b.must(m -> m.range(r -> r
                                        .number(n -> n.field("calories").gte(minCal.doubleValue()))
                                ));
                            }
                            // maxCal 조건 추가
                            if (maxCal != null) {
                                b.must(m -> m.range(r -> r
                                        .number(n -> n.field("calories").lte(maxCal.doubleValue()))
                                ));
                            }
                            return b;
                        }))
                ), ESItem.class).hits().hits().stream()
                .map(hit -> hit.source())
                .collect(Collectors.toList());
    }


    /**
     * 3) 지정 위치 근처 매장 검색 (대략 1km 반경)
     * - 주어진 itemId와 기준 위치(lat, lon)를 이용해 store_items 인덱스에서 검색하며,
     *   기준 위치와의 거리에 따라 오름차순 정렬 후 각 ESStoreItem에 distance 값을 할당합니다.
     */
    public List<ESStoreItem> searchStoreItemsByRange(Integer itemId, double lat, double lon) throws IOException {
        // "latlon" variant를 사용하여 GeoLocation 객체 생성
        GeoLocation location = GeoLocation.of(b -> b.latlon(ll -> ll.lat(lat).lon(lon)));

        // 1km 반경의 Geo Distance 쿼리 생성
        Query geoQuery = Query.of(q -> q
                .geoDistance(GeoDistanceQuery.of(g -> g
                        .field("location")
                        .distance("1km")
                        .location(location)
                ))
        );

        // Elasticsearch 검색 요청 생성 (item_id 조건과 Geo Distance 쿼리, 정렬 포함)
        SearchRequest request = SearchRequest.of(s -> s
                .index("store_items")
                .query(q -> q.bool(b -> b.must(
                        Query.of(qb -> qb.term(t -> t.field("item_id").value(itemId))),
                        geoQuery
                )))
                .sort(so -> so.geoDistance(g -> g
                        .field("location")
                        .location(location)
                        .unit(co.elastic.clients.elasticsearch._types.DistanceUnit.Meters)
                        .order(co.elastic.clients.elasticsearch._types.SortOrder.Asc)
                ))
        );

        // 검색 실행
        SearchResponse<ESStoreItem> response = elasticsearchClient.search(request, ESStoreItem.class);

        // 검색 결과 처리: 정렬 값에서 거리 정보를 추출하여 정수형으로 변환 후 ESStoreItem에 설정
        return response.hits().hits().stream()
                .map(hit -> {
                    ESStoreItem item = hit.source();
                    if (item != null && hit.sort() != null && !hit.sort().isEmpty()) {
                        Object sortObj = hit.sort().get(0);
                        double distance = 0.0;
                        if (sortObj instanceof Number) {
                            distance = ((Number) sortObj).doubleValue();
                        } else if (sortObj instanceof co.elastic.clients.elasticsearch._types.FieldValue) {
                            co.elastic.clients.elasticsearch._types.FieldValue fv =
                                    (co.elastic.clients.elasticsearch._types.FieldValue) sortObj;
                            Object underlying = fv._get();
                            if (underlying instanceof Number) {
                                distance = ((Number) underlying).doubleValue();
                            } else {
                                try {
                                    distance = Double.parseDouble(underlying.toString());
                                } catch (NumberFormatException e) {
                                    distance = 0.0;
                                }
                            }
                        } else {
                            try {
                                distance = Double.parseDouble(sortObj.toString());
                            } catch (NumberFormatException e) {
                                distance = 0.0;
                            }
                        }
                        // double 값을 반올림하여 int로 변환 (예: 0.0 -> 0, 255.3456 -> 255)
                        item.setDistance((int) Math.round(distance));
                    }
                    return item;
                })
                .collect(Collectors.toList());
    }
}
