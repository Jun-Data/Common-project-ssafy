package com.hexa.muinus.elasticsearch.repository;

import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.store.domain.item.Item;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ESItemRepository extends ElasticsearchRepository<ESItem, Integer> {

    List<ESItem> findByItemNameStartingWith(String prefix);

    @Query("""
    {
       "bool": {
        "should": [
          {"match": {"item_name.synonym_graph": {"query": "?0", "fuzziness": "2", "boost": 0.8, "operator": "OR"}}},
          {"match": {"item_name.nori": {"query": "?0", "fuzziness": "2", "boost": 1.2, "operator": "OR"}}},
          {"match": {"item_name.ngram": {"query": "?0", "fuzziness": "2", "boost": 1, "operator": "OR"}}},
          {"match": {"item_name.nori_shingle": {"query": "?0", "fuzziness": "2", "boost": 1.8, "operator": "OR"}}},
          {"match": {"item_name.ngram_shingle": {"query": "?0", "fuzziness": "2", "boost": 1.5, "operator": "OR"}}}
        ],
       "filter": [
         { "range": { "sugars": { "gte": ?1, "lte": ?2 } } },
         { "range": { "calories": { "gte": ?3, "lte": ?4 } } }
       ]
      }
    }
    """)
    List<ESItem> searchItemsByQuery(String query, Integer minSugar, Integer maxSugar, Integer minCal, Integer maxCal);

    @Query(
    """
                   
    """
    )
    List<ESItem> getNoriSearchTokens(String query);
}
