package com.hexa.muinus.common.security;

import com.hexa.muinus.common.exception.general.UnauthorizedException;
import com.hexa.muinus.common.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * SecurityContextHolder에서 인증 정보를 가져와 컨트롤러의 @Authorization 파라미터에 주입합니다.
 */
@Slf4j
@RequiredArgsConstructor
public class AuthorizationArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtProvider jwtProvider;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(Authorization.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        // NativeWebRequest에서 HttpServletRequest를 가져옴
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        // 쿠키에 담긴 AccessToken을 이용해 사용자 이메일 추출
        String userEmail = jwtProvider.getUserEmailFromAccessToken(request);
        log.info("userEmail : {}", userEmail);
        if (userEmail == null) {
            throw new UnauthorizedException("인증 정보가 존재하지 않습니다.");
        }
        return userEmail;
    }
}
