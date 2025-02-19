package com.hexa.muinus.elasticsearch.service;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.ConstantScoreQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.RangeQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery;
import co.elastic.clients.util.ObjectBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueryCreator {

    public static Function<ConstantScoreQuery.Builder, ObjectBuilder<ConstantScoreQuery>> buildConstantScoreQuery(String field, String text, float boost) {
        return csq -> csq
                .filter(f -> f.match(m -> m.field(field).query(text)))
                .boost(boost);
    }


    public static Function<TermsQuery.Builder, ObjectBuilder<TermsQuery>> buildTermsQuery(String field, List<Integer> values) {
        List<FieldValue> fieldValues = values.stream()
                .map(FieldValue::of)
                .toList();

        return termsBuilder -> termsBuilder
                .field(field)
                .terms(t -> t.value(fieldValues));
    }

}
