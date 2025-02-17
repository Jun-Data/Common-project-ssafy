package com.hexa.muinus.store.domain.item.repository;

import com.hexa.muinus.store.domain.item.FliItem;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.fli.FliItemDTO;
import com.hexa.muinus.store.dto.fli.FliResponseDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FliItemRepository extends CrudRepository<FliItem, Integer> {
    @Query("""
    SELECT new com.hexa.muinus.store.dto.fli.FliItemDTO(
        fi.fliItemId, u.userNo, fi.fliItemName, fi.price, fi.quantity, fi.imagePath, fi.applicationDate
    )
    FROM FliItem fi
    JOIN fi.users u
    WHERE fi.store.storeNo = :storeNo
    AND fi.status = 'SELLING'
    AND fi.applicationDate > CURRENT_TIMESTAMP
""")
    List<FliItemDTO> findSellingFliItemsByStoreNo(@Param("storeNo") int storeNo);


    Optional<FliItem> findByStoreAndSectionId(Store store, Integer sectionId);

    Optional<FliItem> findByStoreAndFliItemId(Store store, Integer itemId);

    Optional<FliItem> findByStore_StoreNoAndUsers_UserNoAndFliItemName(Integer storeId, Integer userId, String itemName);

    @Query("SELECT new com.hexa.muinus.store.dto.fli.FliResponseDTO(" +
            "s.storeNo, " +                           // storeId
            "u.userNo, " +                            // userId
            "fu.accountNumber, " +                    // userAccount
            "fu.bank, " +                             // userBank
            "fu.accountName, " +                      // accountName
            "fi.fliItemName, " +                      // itemName
            "fi.quantity, " +                         // quantity
            "fi.price, " +                            // price
            "fi.sectionId, " +                        // sectionNumber
            "fi.applicationDate, " +                  // startDateTime (DB의 application_date)
            "CAST(FUNCTION('DATEDIFF', fi.expirationDate, fi.applicationDate) AS integer), " + // expirationDate
            "fi.imagePath" +                          // imageUrl
            ") " +
            "FROM FliItem fi " +
            "JOIN fi.store s " +
            "JOIN fi.users u " +
            "JOIN FliUser fu ON fu.user.userNo = u.userNo " +
            "WHERE s.storeNo = :storeId " +
            "AND fi.status = 'PENDING'")
    List<FliResponseDTO> findPendingFliResponseByStoreId(@Param("storeId") int storeId);
}
