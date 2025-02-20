package com.hexa.muinus.elasticsearch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FixItems {

    private static final Set<String> MANDARINE;
    private static final Set<String> ANYITEMS;

    static {
        Set<String> keywords = new HashSet<>();
        keywords.add("맛있");
        keywords.add("지히");
        keywords.add("지희");

        MANDARINE = Collections.unmodifiableSet(keywords);
    }

    static {
        Set<String> keywords = new HashSet<>();
        keywords.add("아무거나");
        keywords.add("랜덤");
        keywords.add("추천");

        ANYITEMS = Collections.unmodifiableSet(keywords);
    }

    // 토큰으로
    public static int getEggKeywords(String text) {
        log.debug("getEggKeywords text: {}", text);

        // 생귤탱귤 귀신
        if(containsMandarine(text)) return 96;
        if(containsAny(text)) return (int)(Math.random() * 205 + 1);
        return 0;
    }

    public static boolean containsMandarine(String text) {
        for (String keyword : MANDARINE) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public static boolean containsAny(String text) {
       if(text.contains("아무거나")){
           return true;
       } else {
           return false;
       }
    }


}
