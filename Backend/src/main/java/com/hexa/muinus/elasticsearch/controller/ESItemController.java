package com.hexa.muinus.elasticsearch.controller;

import com.hexa.muinus.common.security.Authorization;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.domain.ESStoreItem;
import com.hexa.muinus.elasticsearch.service.ESItemService;
import com.hexa.muinus.elasticsearch.dto.SearchNativeDTO;
import com.hexa.muinus.elasticsearch.service.ItemSearchEngine;
import com.hexa.muinus.elasticsearch.service.SimpleRecommandService;
import com.hexa.muinus.store.domain.item.Item;
import com.hexa.muinus.store.domain.item.repository.ItemRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
public class ESItemController {

    private final ESItemService esItemService;
    private final ItemSearchEngine searchEngine;
    private final SimpleRecommandService recommandService;

    @GetMapping("/autocomplete")
    public List<ESItem> autocomplete(@RequestParam String prefix) throws IOException {
        return esItemService.autocompleteItemName(prefix);
    }

    @GetMapping("/search")
    public List<ESItem> searchByRange(@RequestParam(required = false) Integer minSugar,
                                      @RequestParam(required = false) Integer maxSugar,
                                      @RequestParam(required = false) Integer minCal,
                                      @RequestParam(required = false) Integer maxCal) throws IOException {
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
    public ResponseEntity<List<ESStoreItem>> searchStoreItems (
            @RequestParam("itemId") Integer itemId,
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) throws IOException {

        List<ESStoreItem> results = esItemService.searchStoreItemsByRange(itemId, lat, lon);
        return ResponseEntity.ok(results);
    }

    /**
     * 검색
     * @param searchNativeDTO
     * @return
     */
    @GetMapping("/search-native")
    public ResponseEntity<List<ESItem>> searchByQuery(@Valid @ModelAttribute SearchNativeDTO searchNativeDTO) {
        log.info("Search Item: {}", searchNativeDTO);
        return ResponseEntity.ok(searchEngine.searchByQuery(searchNativeDTO));
    }

    /**
     * 추천
     * @param userEmail
     * @return
     */
    @GetMapping("/recommand")
    public ResponseEntity<List<ESItem>> getRecommandedItems(@Authorization String userEmail) {
        log.info("Getting Recommanded Items - user: {}", userEmail);
        return ResponseEntity.ok(recommandService.getRecommendedItems(userEmail));
    }

    private final ItemRepository itemRepository;

    @GetMapping("/recommand-test")
    public ResponseEntity<List<Optional<Item>>> getRecommandTest(/*@Authorization String userEmail*/) {
        List<Optional<Item>> list = new ArrayList<>();
        list.add(itemRepository.findById((int)(Math.random()*100 + 10)));
        list.add(itemRepository.findById((int)(Math.random()*100 + 10)));
        list.add(itemRepository.findById((int)(Math.random()*100 + 10)));
        list.add(itemRepository.findById((int)(Math.random()*100 + 10)));
        list.add(itemRepository.findById((int)(Math.random()*100 + 10)));
        return ResponseEntity.ok(list);
    }


}

