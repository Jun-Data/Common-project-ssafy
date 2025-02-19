package com.hexa.muinus.store.domain.item.repository;

import com.hexa.muinus.store.domain.item.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Integer> {

    Optional<Item> findItemByBarcode(String barcode);
    List<Item> findItemByUpdatedAtAfter(LocalDateTime yesterday);

    List<Item> findTopByItemIdIsIn(Collection<Integer> itemIds);

    @Query(value = """
        SELECT i.* 
        FROM item i
        JOIN (
        	SELECT p.item_id, SUM(p.monthly_score * s.similarity) AS item_score FROM preference p
        	JOIN\s
        	(
        		SELECT mp.updated_at, mp.user_no AS my_no, yp.user_no AS your_no, (SUM(mp.monthly_score * yp.monthly_score)) / ((SQRT(SUM(POW(mp.monthly_score, 2)))) * (SQRT(SUM(POW(yp.monthly_score, 2))))) AS similarity
        		FROM preference mp
        		INNER JOIN preference yp ON mp.item_id = yp.item_id
        		JOIN users u ON u.user_no = mp.user_no
        		WHERE mp.updated_at = :yesterday
        		AND u.email = :userEmail   
        		AND mp.user_no != yp.user_no
        		GROUP BY mp.user_no, yp.user_no
        		HAVING similarity >= :minSimilarity
        	) s
        	ON p.user_no = s.your_no
        	WHERE p.item_id NOT IN (SELECT sp.item_id FROM preference sp
                                    WHERE sp.updated_at >= :recentDate AND sp.user_no = s.my_no AND daily_score > 0)
        	GROUP BY item_id
        	) si
        ON si.item_id = i.item_id
        ORDER BY item_score DESC
    """, nativeQuery = true)
    List<Item> findItemsByUserSimilarity(String userEmail, LocalDate yesterday, float minSimilarity,  LocalDate recentDate);
}
