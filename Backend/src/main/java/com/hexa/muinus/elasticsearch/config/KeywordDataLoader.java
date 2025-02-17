package com.hexa.muinus.elasticsearch.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class KeywordDataLoader implements InitializingBean {

//    private static final String BRAND_DATA_PATH = "src/main/resources/elasticsearch/data/brand.txt";
//    private static final String TYPE_DATA_PATH = "src/main/resources/elasticsearch/data/type.txt";

    private static final String BRAND_DATA_PATH = "elasticsearch/data/brand.txt";
    private static final String TYPE_DATA_PATH = "elasticsearch/data/type.txt";

    public static Set<String> BRAND_KEYWORDS = new HashSet<>();
    public static Set<String> TYPE_KEYWORDS = new HashSet<>();

    public static Set<String> getBrandKeywords() {
        return BRAND_KEYWORDS;
    }

    public static Set<String> getTypeKeywords() {
        return TYPE_KEYWORDS;
    }

    @Override
    public void afterPropertiesSet() throws Exception {

        loadKeywords(BRAND_DATA_PATH, BRAND_KEYWORDS);
        loadKeywords(TYPE_DATA_PATH, TYPE_KEYWORDS);

        log.info("Loading keywords from file...");

        // 파일에서 단어 목록 읽기 (각 줄에 하나의 단어)
//        BRAND_KEYWORDS.addAll(Files.readAllLines(Paths.get(BRAND_DATA_PATH), StandardCharsets.UTF_8));
//        TYPE_KEYWORDS.addAll(Files.readAllLines(Paths.get(TYPE_DATA_PATH), StandardCharsets.UTF_8));
        log.info("Brand words({}): {}", BRAND_KEYWORDS.size(), BRAND_KEYWORDS);
        log.info("Type words({}): {}", TYPE_KEYWORDS.size(), TYPE_KEYWORDS);

        log.info("Successfully loaded keywords");
    }

    private void loadKeywords(String resourcePath, Set<String> keywordSet) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(resourcePath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            keywordSet.addAll(reader.lines().collect(Collectors.toSet()));

        } catch (Exception e) {
            log.error("Failed to load keywords from {}: {}", resourcePath, e.getMessage());
        }
    }
}
