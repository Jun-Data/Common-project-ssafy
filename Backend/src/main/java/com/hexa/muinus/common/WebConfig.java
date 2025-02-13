package com.hexa.muinus.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://i12a506.p.ssafy.io", "http://3.39.235.66", "https://i12a506.p.ssafy.io")
                .allowedMethods("*")
                .allowedHeaders("Content-Type", "Accept", "Origin", "X-Requested-With")
                .allowCredentials(true);
    }
}