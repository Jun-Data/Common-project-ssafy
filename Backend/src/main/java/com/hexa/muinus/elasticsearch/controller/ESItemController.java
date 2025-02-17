package com.hexa.muinus.elasticsearch.controller;

import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.domain.ESStoreItem;
import com.hexa.muinus.elasticsearch.service.ESItemService;
import com.hexa.muinus.elasticsearch.dto.SearchNativeDTO;
import com.hexa.muinus.elasticsearch.service.ItemNameSearchEngine;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
public class ESItemController {

    private final ESItemService esItemService;
    private final ItemNameSearchEngine searchEngine;
    private final ItemNameSearchEngine itemNameSearchEngine;

    @GetMapping("/autocomplete")
    public List<ESItem> autocomplete(@RequestParam String prefix) {
        return esItemService.autocompleteItemName(prefix);
    }

    @GetMapping("/search")
    public List<ESItem> searchByRange(@RequestParam(required = false) Integer minSugar,
                                      @RequestParam(required = false) Integer maxSugar,
                                      @RequestParam(required = false) Integer minCal,
                                      @RequestParam(required = false) Integer maxCal) {
        return esItemService.searchBySugarAndCalorieRange(minSugar, maxSugar, minCal, maxCal);
    }

    /**
     * 특정 아이템(itemId)과 기준 좌표(lat, lon)를 받아 반경 1km 내의 매장을 검색합니다.
     *
     * @param itemId  아이템 ID
     * @param lat     기준 위도
     * @param lon     기준 경도
     * @return        검색된 매장 리스트
     */
    @GetMapping("/store-items")
    public ResponseEntity<List<ESStoreItem>> searchStoreItems(
            @RequestParam("itemId") Integer itemId,
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) {

        List<ESStoreItem> results = esItemService.searchStoreItemsByRange(itemId, lat, lon);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/store-list")
    public ResponseEntity<List<ESStoreItem>> searchStore(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) {

        List<ESStoreItem> results = esItemService.searchStoreByRange(lat, lon);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-native")
    public List<ESItem> searchByQuery(@Valid @ModelAttribute SearchNativeDTO searchNativeDTO) {
        log.info("Search Item: {}", searchNativeDTO);
        return searchEngine.searchByQuery(searchNativeDTO);
    }
}

