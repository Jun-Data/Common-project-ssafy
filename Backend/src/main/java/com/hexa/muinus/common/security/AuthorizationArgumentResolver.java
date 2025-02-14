package com.hexa.muinus.common.security;

import com.hexa.muinus.common.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * SecurityContextHolder에서 인증 정보를 가져와 컨트롤러의 @Authorization 파라미터에 주입합니다.
 */
@RequiredArgsConstructor
public class AuthorizationArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtProvider jwtProvider;

    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(Authorization.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증 정보가 존재하지 않습니다.");
        }

        String userEmail = (String) authentication.getPrincipal();
        return userEmail;
    }
}
