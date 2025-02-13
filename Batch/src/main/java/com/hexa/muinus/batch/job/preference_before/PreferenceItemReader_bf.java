//package com.hexa.muinus.batch.job.preference_before;
//
//import com.hexa.muinus.batch.domain.Preference;
//import com.hexa.muinus.batch.domain.PreferenceId;
//import com.hexa.muinus.batch.exeption.BatchErrorCode;
//import com.hexa.muinus.batch.exeption.BatchProcessingException;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.batch.item.ItemReader;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.core.ParameterizedTypeReference;
//import org.springframework.http.ResponseEntity;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.stereotype.Component;
//import org.springframework.web.client.HttpClientErrorException;
//import org.springframework.web.client.ResourceAccessException;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import javax.sql.DataSource;
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.*;
//import java.util.concurrent.atomic.AtomicBoolean;
//
//@Slf4j
//@Component
//public class PreferenceItemReader_bf implements ItemReader<Preference> {
//    private final String baseUrl = "http://localhost:8090";
//    private final String apiUri = "/api/batch/preferences";
//
//    private final JdbcTemplate jdbcTemplate;
//    private final WebClient webClient; // 비동기식 API 호출 -> 속도 개선
//    private Iterator<Preference> preferenceIterator;
//
//    private final AtomicBoolean dataFetched = new AtomicBoolean(false);
//
//    @Autowired
//    public PreferenceItemReader_bf(@Qualifier("dataDBSource") DataSource dataDBSource, WebClient.Builder webClientBuilder) {
//        this.jdbcTemplate = new JdbcTemplate(dataDBSource);
//        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
//    }
//
//    @Override
//    public Preference read() {
//        if (!dataFetched.get()) {
//            List<Preference> preferences = fetchPreferencesFromAPI();
//            this.preferenceIterator = preferences.iterator();
//            dataFetched.set(true);
//        }
//        return preferenceIterator != null && preferenceIterator.hasNext() ? preferenceIterator.next() : null;
//    }
//
//    // ITEM READ (API 호출 및 데이터 가공)
//    private List<Preference> fetchPreferencesFromAPI() {
//        List<Long> users = jdbcTemplate.query("SELECT user_no FROM users", (rs, rowNum) -> rs.getLong("user_no"));
//        List<Long> items = jdbcTemplate.query("SELECT item_id FROM item", (rs, rowNum) -> rs.getLong("item_id"));
//
//        log.info("배치 API 호출 - Size(Users): {}, Size(Items): {}", users.size(), items.size());
//        log.debug("배치 Users : {}" , users);
//        log.debug("배치 Items : {}" , items);
//
//        LocalDate today = LocalDate.now();
//        List<Preference> preferences = new ArrayList<>();
//
//        try {
//            ResponseEntity<List<Map<Long, Map<Long, BigDecimal>>>> response = webClient.post()
//                    .uri(apiUri)
//                    .bodyValue(Map.of("users", users, "items", items))
//                    .retrieve()
//                    .toEntity(new ParameterizedTypeReference<List<Map<Long, Map<Long, BigDecimal>>>>() {})
//                    .block(); // block : 동기 - API 응답이 올 때까지 동기적으로 대기
//
//            if (response.getBody() == null) {
//                log.warn("API 응답이 비어있습니다.");
//                throw new BatchProcessingException(BatchErrorCode.API_CALL_FAILED);
//            }
//
//            log.info("API 호출 성공 - 응답 크기: {}", response.getBody().size());
//
//            // 데이터 변환
//            for (Map<Long, Map<Long, BigDecimal>> userMap : response.getBody()) {
//                userMap.forEach((userNo, itemMap) ->
//                        itemMap.forEach((itemId, score) ->
//                                preferences.add(new Preference(new PreferenceId(userNo, itemId), score, today))
//                        )
//                );
//            }
//        } catch (HttpClientErrorException e) {
//            log.error("API 요청 실패 (HTTP 오류): StatusCode={}, Message={}", e.getStatusCode(), e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.API_CALL_FAILED, e);
//        } catch (ResourceAccessException e) {
//            log.error("API 요청 실패 (네트워크 오류): {}", e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.API_CALL_FAILED, e);
//        } catch (Exception e) {
//            log.error("알 수 없는 오류 발생: {}", e.getMessage(), e);
//            throw new BatchProcessingException(BatchErrorCode.UNKNOWN_ERROR, e);
//        }
//
//        return preferences;
//    }
//}
