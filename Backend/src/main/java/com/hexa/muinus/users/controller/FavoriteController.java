package com.hexa.muinus.users.controller;

import com.hexa.muinus.users.dto.FavoriteRequestDto;
import com.hexa.muinus.users.dto.FavoriteResponseDto;
import com.hexa.muinus.users.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<String> addFavorite(HttpServletRequest request, @RequestBody FavoriteRequestDto favoriteRequestDto){
        favoriteService.addFavorite(request, favoriteRequestDto);
        return ResponseEntity.ok("Favorite added successfully");
    }

    @GetMapping("/list")
    public ResponseEntity<List<FavoriteResponseDto>> getFavorites(HttpServletRequest request){
        List<FavoriteResponseDto> favorites = favoriteService.getFavoritesByUser(request);
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFavorite(HttpServletRequest request, FavoriteRequestDto favoriteRequestDto) {
        favoriteService.deleteFavorite(request, favoriteRequestDto);
        return new ResponseEntity<>("Favorite deleted successfully", HttpStatus.OK);
    }

}
