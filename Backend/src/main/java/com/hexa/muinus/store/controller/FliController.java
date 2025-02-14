package com.hexa.muinus.store.controller;

import com.hexa.muinus.store.dto.fli.FliCheckDTO;
import com.hexa.muinus.store.dto.fli.FliRequestDTO;
import com.hexa.muinus.store.dto.fli.FliResponseDTO;
import com.hexa.muinus.store.service.FliRequestService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fli")
@RequiredArgsConstructor
public class FliController {

    private final FliRequestService fliService;

    @PostMapping("/register")
    public ResponseEntity<String> registerFli(HttpServletRequest request, @RequestBody FliRequestDTO dto) {
        fliService.registerFli(request, dto);
        return ResponseEntity.ok("Fli registration successful");
    }

    @PostMapping("/check")
    public ResponseEntity<String> checkFli(@RequestBody FliCheckDTO dto) {
        fliService.checkFli(dto);
        return ResponseEntity.ok("Fli check successful");
    }

    @PostMapping("/reject")
    public ResponseEntity<String> rejectFli(@RequestBody FliCheckDTO dto) {
        fliService.rejectFli(dto);
        return ResponseEntity.ok("Fli reject successful");
    }

    @GetMapping("/list")
    public ResponseEntity<List<FliResponseDTO>> listFli(@RequestParam("email") String email) {
        return ResponseEntity.ok(fliService.listFli(email));
    }
}

