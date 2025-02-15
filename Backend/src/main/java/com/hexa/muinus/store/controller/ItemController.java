package com.hexa.muinus.store.controller;

import com.hexa.muinus.store.domain.item.RequestReceiving;
import com.hexa.muinus.store.dto.item.ItemRequestDTO;
import com.hexa.muinus.store.dto.item.ItemResponseDTO;
import com.hexa.muinus.store.service.RequestReceivingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item")
@RequiredArgsConstructor
public class ItemController {

    private final RequestReceivingService requestReceivingService;

    @PostMapping("/register")
    public ResponseEntity<?> createRequestReceiving(HttpServletRequest request, @RequestBody ItemRequestDTO dto) {
        RequestReceiving savedRequest = requestReceivingService.createRequestReceiving(request, dto.getStoreId(), dto.getItemId());
        return ResponseEntity.ok("register is successful");
    }

    @GetMapping("/regist_list")
    public ResponseEntity<List<ItemResponseDTO>> getRegistList(HttpServletRequest request) {
        List<ItemResponseDTO> result = requestReceivingService.getItemRequestCounts(request);
        return ResponseEntity.ok(result);
    }
}
