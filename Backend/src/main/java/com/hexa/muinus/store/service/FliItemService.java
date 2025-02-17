package com.hexa.muinus.store.service;

import com.hexa.muinus.common.exception.item.FliItemNotFoundException;
import com.hexa.muinus.common.exception.item.SectionFliItemNotFoundException;
import com.hexa.muinus.store.domain.item.FliItem;
import com.hexa.muinus.store.domain.item.repository.FliItemRepository;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.fli.FliItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FliItemService {

    private final FliItemRepository fliItemRepository;

    @Transactional
    public FliItem findFliItemByStoreAndSectionId(Store store, Integer sectionId) {
        return fliItemRepository.findByStoreAndSectionId(store, sectionId)
                .orElseThrow(() -> new SectionFliItemNotFoundException(store.getStoreNo(), sectionId));
    }

    @Transactional
    public FliItem findFliItemByStoreAndFliItemId(Store store, Integer fliItemId) {
        return fliItemRepository.findByStoreAndFliItemId(store, fliItemId)
                .orElseThrow(() -> new FliItemNotFoundException(store.getStoreNo(), fliItemId));
    }

    /**
     * 해당 매장에서 판매중인 플리마켓 상품
     * @param storeNo 매장 번호
     * @return List<FliItemDTO>
     */
    public List<FliItemDTO> getSellingFliItemsByStoreNo(Integer storeNo) {
        return fliItemRepository.findSellingFliItemsByStoreNo(storeNo);
    }
}
