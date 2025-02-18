package com.hexa.muinus.store.domain.item.repository;

import com.hexa.muinus.store.domain.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Integer> {

    Optional<Item> findItemByBarcode(String barcode);
    List<Item> findItemByUpdatedAtAfter(LocalDateTime yesterday);

    List<Item> findTopByItemIdIsIn(Collection<Integer> itemIds);
}
