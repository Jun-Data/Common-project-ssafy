package com.hexa.muinus.common;

import com.hexa.muinus.common.security.AuthorizationArgumentResolver;
import com.hexa.muinus.common.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtProvider jwtProvider;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3000/", "http://i12a506.p.ssafy.io", "http://3.39.235.66", "https://i12a506.p.ssafy.io")
                .allowedMethods("*")
                .allowedHeaders("Content-Type", "Accept", "Origin", "X-Requested-With")
                .allowCredentials(true);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        // JwtProvider를 필요로 하는 경우 생성자를 통해 주입받은 객체를 사용
        resolvers.add(new AuthorizationArgumentResolver(jwtProvider));
    }
}