package com.hexa.muinus.store.domain.item.repository;

import com.hexa.muinus.store.domain.item.RequestReceiving;
import com.hexa.muinus.store.domain.item.RequestReceivingId;
import com.hexa.muinus.store.dto.item.ItemResponseDTO;
import com.hexa.muinus.users.domain.user.Users;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequestReceivingRepository extends CrudRepository<RequestReceiving, RequestReceivingId> {

    @Query("SELECT new com.hexa.muinus.store.dto.item.ItemResponseDTO(r.item.itemName, COUNT(r)) " +
            "FROM RequestReceiving r " +
            "WHERE r.store.storeNo = :storeNo " +
            "GROUP BY r.item.itemName " +
            "ORDER BY COUNT(r) DESC")
    List<ItemResponseDTO> findItemRequestCountsByStoreNo(@Param("storeNo") Integer storeNo);


    boolean existsByUser(Users user);

    RequestReceiving findTopByUserOrderByCreatedAtDesc(Users user);
}
