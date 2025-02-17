package com.hexa.muinus;

import com.hexa.muinus.common.exception.ESErrorCode;
import com.hexa.muinus.common.exception.MuinusException;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.repository.ESItemRepository;
import com.hexa.muinus.store.domain.item.Item;
import com.hexa.muinus.store.domain.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemSynchronizer {

    private final ItemRepository itemRepository;
    private final ESItemRepository esItemRepository;
    private final OktService nlpService;

    /**
     * 매일 한시
     * MySQL ITEM, ES ITEM 자동 동기화
     */
    @Scheduled(cron = "0 0/1 * * * *")
//    @Scheduled(cron = "0 12 9 * * ?")
    public void scheduledSync() {
        try {
            log.info("MySQL Item -> ES Item 동기화 시작 :{}", LocalDateTime.now());
            synchronizeAll();
            log.info("MySQL Item -> ES Item 동기화 완료 :{}", LocalDateTime.now());
        } catch (Exception e) {
            log.error("MySQL Item -> ES Item 동기화 실패: " + e.getMessage());
        }
    }

    public void synchronizeAll() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        try {
            List<Item> items = itemRepository.findAll(); // 임시
            if (items.isEmpty()) {
                return;
            }
            List<ESItem> esItems = items.stream()
                    .map(this::convertToESItem)
                    .toList();
            esItemRepository.saveAll(esItems);

        } catch (Exception e) {
            throw new MuinusException(ESErrorCode.ES_INDEX_NOT_FOUND);
        }

    }

    private ESItem convertToESItem(Item item) {
        ESItem esItem = new ESItem();
        esItem.setItemId(item.getItemId());
        esItem.setBarcode(item.getBarcode());
        esItem.setItemName(item.getItemName());
        esItem.setBrand(item.getBrand());
        esItem.setCalories(item.getCalories());
        esItem.setProtein(item.getProtein());
        esItem.setFat(item.getFat());
        esItem.setCarbohydrate(item.getCarbohydrate());
        esItem.setSugars(item.getSugars());
        esItem.setWeight(item.getWeight());
        esItem.setItemImageUrl(item.getItemImageUrl());
//        esItem.setUpdatedAt(item.getUpdatedAt());
        return esItem;
    }
}