package com.hexa.muinus.users.domain.favorite.controller;

import com.hexa.muinus.users.domain.favorite.Favorites;
import com.hexa.muinus.users.domain.favorite.dto.FavoriteRequestDto;
import com.hexa.muinus.users.domain.favorite.dto.FavoriteResponseDto;
import com.hexa.muinus.users.domain.favorite.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/add")
    public ResponseEntity<String> addFavorite(@RequestBody FavoriteRequestDto favoriteRequestDto){
        favoriteService.addFavorite(favoriteRequestDto.getUserNo(), favoriteRequestDto.getStoreNo());
        return ResponseEntity.ok("Favorite added successfully");
    }

    @GetMapping("/{userNo}")
    public ResponseEntity<List<FavoriteResponseDto>> getFavorites(@PathVariable Integer userNo){
        List<FavoriteResponseDto> favorites = favoriteService.getFavoritesByUser(userNo);
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/{userNo}/{storeNo}")
    public ResponseEntity<String> deleteFavorite(@PathVariable Integer userNo, @PathVariable Integer storeNo) {
        favoriteService.deleteFavorite(userNo, storeNo);
        return new ResponseEntity<>("Favorite deleted successfully", HttpStatus.OK);
    }

}
