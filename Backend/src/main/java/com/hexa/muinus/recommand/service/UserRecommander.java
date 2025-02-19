package com.hexa.muinus.recommand.service;

import com.hexa.muinus.store.domain.item.repository.ItemRepository;
import com.hexa.muinus.store.domain.item.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserRecommander {

    private final ItemRepository itemRepository;

    private static final Float MIN_SIMILARITY = 0.5F;

    public List<Item> getRecommendedItems(String userEmail) {
        log.debug("Get recommended items by user {}", userEmail);
        return selectRecommandItems(userEmail);
    }

    private List<Item> processRecommendations(String userEmail) {
        log.debug("Process recommendations by user {}", userEmail);
        return itemRepository.findItemsByUserSimilarity(userEmail, LocalDate.now(), MIN_SIMILARITY, LocalDate.now().minusDays(5));
    }

    private List<Item> selectRecommandItems(String userEmail) {
        List<Item> similarItems = processRecommendations(userEmail);
        List<Item> finalItems = new ArrayList<>();
        int size = similarItems.size();
        // 5개 반환하기
        if (size <= 10) {
            finalItems = similarItems.subList(0, Math.min(size, 10));
        }else {
            finalItems = similarItems.subList(0, (int)Math.max((size/10), 10));
        }
        Collections.shuffle(finalItems);
        return finalItems.subList(0, Math.min(finalItems.size(), 5));
    }
}
