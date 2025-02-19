package com.hexa.muinus.store.domain.store.repository;

import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.store.StoreDTO;
import com.hexa.muinus.users.domain.user.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Integer> {

    Store findByLocationXAndLocationY(BigDecimal locationX, BigDecimal locationY);
    Store findByRegistrationNo(String registrationNo);
    Store findByUser(Users users);
    Optional<Store> findByUserAndStoreNo(Users user, Integer storeNo);
    Optional<Store> findByUser_UserNoAndStoreNo(Integer userNo, Integer storeNo);
    Optional<Store> findByUser_Email(String email);


    @Query(value = """
        SELECT 	s.store_no AS storeNo, s.name AS name, s.location_x AS locationX, s.location_y AS locationY,
                s.address AS address, s.phone AS phone, i.item_name AS itemName, si.sale_price AS salePrice,
                si.discount_rate AS discountRate, si.quantity AS quantity, s.flimarket_yn AS flimarketYn,
                SQRT(POW((s.location_x - :x) * 111, 2) + POW((s.location_y - :y) * 111 * COS(RADIANS(:y)), 2)) * 1000 AS distance
         FROM store s
         JOIN store_item si ON si.store_no = s.store_no
         AND	 si.item_id = :itemId
         JOIN item i ON i.item_id = si.item_id
         WHERE SQRT(POW((s.location_x - :x) * 111, 2) + POW((s.location_y - :y) * 111 * COS(RADIANS(:y)), 2)) * 1000 <= :radius
         AND   si.quantity > 0
         ORDER BY distance
    """, nativeQuery = true)
    List<StoreSearchProjection> findStoresByItemIdAndRadius(@Param("itemId") Integer itemId,
                                                     @Param("x") Double x,
                                                     @Param("y") Double y,
                                                     @Param("radius") int radius);
    @Query(value = """
        SELECT  s.store_no AS storeNo, s.name AS name, s.location_x AS locationX, s.location_y AS locationY,
                SQRT(POW((s.location_x - :x) * 111, 2) + POW((s.location_y - :y) * 111 * COS(RADIANS(:y)), 2)) * 1000 AS distance
        FROM store s
        WHERE SQRT(POW((s.location_x - :x) * 111, 2) + POW((s.location_y - :y) * 111 * COS(RADIANS(:y)), 2)) < 1
        ORDER BY distance

        """, nativeQuery = true)
    List<StoreMapProjection> findStoreByUserLocation(@Param("x") Double x, @Param("y") Double y);

    @Query("""
        SELECT new com.hexa.muinus.store.dto.store.StoreDTO(
            s.storeNo, s.user.userNo, s.name, 
            s.address, s.storeImageUrl, s.phone, s.flimarketYn
        )
        FROM Store s
        WHERE s.storeNo = :storeNo
    """)
    Optional<StoreDTO> findStoreDTOById(@Param("storeNo") int storeNo);
    // 가게 이름으로 store_no 조회
    @Query("SELECT s.storeNo FROM Store s WHERE s.name = :storeName")
    Optional<Integer> findStoreNoByName(@Param("storeName") String storeName);

    @Modifying
    @Query(value = "INSERT INTO store (user_no, name, location_x, location_y, address, registration_no, flimarket_yn, flimarket_section_cnt) " +
            "VALUES (:userNo, :name, :latitude, :longitude, :address, :registrationNo, :flimarketYn, :fliMarketSectionCount)", nativeQuery = true)
    int saveStore(Integer userNo, String name, Double longitude, Double latitude, String address, String registrationNo, String flimarketYn, Byte fliMarketSectionCount);

    Store findStoreByUser_Email(String userEmail);

    interface StoreMapProjection {
        int getStoreNo();
        String getName();
        Double getLocationX();
        Double getLocationY();
        double getDistance();
    }

    interface StoreSearchProjection {
        int getStoreNo();
        String getName();
        double getLocationX();
        double getLocationY();
        String getAddress();
        String getPhone();
        String getItemName();
        int getSalePrice();
        int getDiscountRate();
        int getQuantity();
        Character getFlimarketYn() ;
        double getDistance();
    }
}
