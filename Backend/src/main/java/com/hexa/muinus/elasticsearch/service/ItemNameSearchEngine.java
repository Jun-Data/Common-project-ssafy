package com.hexa.muinus.elasticsearch.service;

import com.hexa.muinus.common.exception.ESErrorCode;
import com.hexa.muinus.common.exception.MuinusException;
import com.hexa.muinus.elasticsearch.domain.ESItem;
import com.hexa.muinus.elasticsearch.dto.SearchNativeDTO;
import com.hexa.muinus.elasticsearch.repository.ESItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemNameSearchEngine {

    private final ESItemRepository esItemRepository;

    public List<ESItem> searchByQuery(SearchNativeDTO dto) {
        String query = dto.getQuery();
        Integer minSugar = dto.getMinSugar();
        Integer maxSugar = dto.getMaxSugar();
        Integer minCal = dto.getMinCal();
        Integer maxCal = dto.getMaxCal();

        try {
            List<ESItem> results = esItemRepository.searchItemsByQuery(query, minSugar, maxSugar, minCal, maxCal);
            log.debug("results: {}", results);

            return results;

        } catch (Exception e) {
            e.printStackTrace();
            throw new MuinusException(ESErrorCode.ES_QUERY_ERROR, "Elasticsearch 검색 중 오류 발생");
        }
    }
}