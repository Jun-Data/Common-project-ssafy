package com.hexa.muinus.users.domain.preference.repository;

import com.hexa.muinus.elasticsearch.dto.PreferTrendsProjection;
import com.hexa.muinus.users.domain.preference.Preference;
import com.hexa.muinus.users.domain.preference.PreferenceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.time.LocalDate;
import java.util.List;

@Repository
public interface PreferenceRepository extends JpaRepository<Preference, PreferenceId> {
    /**
     * itemId
     * itemName
     * purchaseCount - 30일 동안 구매 일수 (횟수 - 빈도)
     * trendRating - 30일 모든 유저 구매 개수 합계 (상품별) / 30일 동안 모든 유저가 구매한 상품 개수 총 합
     * @param userEmail
     * @param monthAgo
     * @return
     */
    @Query(value = """
        select lp.item_id AS itemId, lp.item_name AS itemName, lp.purchase_count AS purchaseCount, (lp.item_score / lp.all_total_score) as trendRating
        from
        (
            (
            select mp.item_id, mp.item_name, mp.purchase_count, op.item_score, ap.all_total_score
            from (
                select p.item_id, i.item_name, count(*) as purchase_count from preference p
                join users u on u.user_no = p.user_no
                join item i on i.item_id = p.item_id
                where u.email = :userEmail
                and p.updated_at >= :monthAgo
                and p.daily_score > 0
                group by item_id
            ) mp
            left join (
                select item_id, sum(daily_score) AS item_score
                from preference p
                where updated_at >= :monthAgo
                group by item_id
                ) op
            on mp.item_id = op.item_id
            join (
                select sum(a.daily_score) AS all_total_score from preference a where a.updated_at >= :monthAgo) ap
            )
        )  lp
    """, nativeQuery = true)
    List<PreferTrendsProjection> findItemsByScore(String userEmail, LocalDate monthAgo);

    @Query(value = """
        SELECT distinct p.item_id FROM preference p JOIN users u ON u.user_no = p.user_no
        WHERE u.email = :userEmail AND  p.updated_at >= :date AND daily_score > 0 ORDER BY p.item_id;
    """, nativeQuery = true)
    List<Integer> getRecentItems(String userEmail, LocalDate date);

}
