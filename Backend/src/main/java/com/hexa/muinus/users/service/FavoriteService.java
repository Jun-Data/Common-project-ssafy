package com.hexa.muinus.users.service;

import com.hexa.muinus.common.exception.store.StoreNotFoundException;
import com.hexa.muinus.common.exception.user.FavoriteStoreDuplicate;
import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.users.domain.favorite.Favorites;
import com.hexa.muinus.users.domain.favorite.FavoritesId;
import com.hexa.muinus.users.dto.FavoriteRequestDto;
import com.hexa.muinus.users.dto.FavoriteResponseDto;
import com.hexa.muinus.users.domain.favorite.repository.FavoriteRepository;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final JwtProvider jwtProvider;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    @Transactional
    public void addFavorite(HttpServletRequest request, FavoriteRequestDto favoriteRequestDto){
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회 후 userNo 추출
        Users user = userRepository.findByEmail(email);
        Integer userNo = user.getUserNo();


        // 가게 조회
        Integer storeNo = favoriteRequestDto.getStoreNo();
        Store store = storeRepository.findById(storeNo)
                .orElseThrow(() -> new StoreNotFoundException(storeNo));

        FavoritesId favoritesId = new FavoritesId(userNo, storeNo);
        if(favoriteRepository.existsById(favoritesId)){
            throw new FavoriteStoreDuplicate(userNo, storeNo);
        }

        Favorites favorite = new Favorites(favoritesId, user, store);
        favoriteRepository.save(favorite);
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponseDto> getFavoritesByUser(HttpServletRequest request) {
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = userRepository.findByEmail(email);
        Integer userNo = user.getUserNo();

        //사용자 No로 즐겨찾기된 Store 정보를 조회.
        List<Integer> storeNoList = favoriteRepository.findStoreNoListByUser(userNo);

        //Store 정보를 기반으로 FavoriteResponseDto 리스트 생성
        return storeNoList.stream().map(storeNo -> {
            Store store = storeRepository.findById(storeNo).orElseThrow(() -> new StoreNotFoundException(storeNo));
            return new FavoriteResponseDto(store.getStoreNo(), store.getName(), store.getAddress());
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteFavorite(HttpServletRequest request, FavoriteRequestDto favoriteRequestDto) {
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = userRepository.findByEmail(email);
        Integer userNo = user.getUserNo();

        Integer storeNo = favoriteRequestDto.getStoreNo();

        favoriteRepository.deleteByUserNoAndStoreNo(userNo, storeNo);
    }
}

