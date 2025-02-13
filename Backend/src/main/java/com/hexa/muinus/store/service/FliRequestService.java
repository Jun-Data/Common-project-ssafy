package com.hexa.muinus.store.service;


import com.hexa.muinus.common.exception.store.StoreNotFoundException;
import com.hexa.muinus.common.exception.user.UserNotFoundException;
import com.hexa.muinus.common.s3.service.S3ImageService;
import com.hexa.muinus.store.domain.item.FliItem;
import com.hexa.muinus.store.domain.item.FliItem.FliItemStatus;
import com.hexa.muinus.store.domain.item.repository.FliItemRepository;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.store.dto.fli.FliCheckDTO;
import com.hexa.muinus.store.dto.fli.FliRequestDTO;

import com.hexa.muinus.store.dto.fli.FliResponseDTO;
import com.hexa.muinus.users.domain.user.FliUser;
import com.hexa.muinus.users.domain.user.Users;

import com.hexa.muinus.users.domain.user.repository.FliUserRepository;
import com.hexa.muinus.users.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FliRequestService {

    private final FliUserRepository fliUserRepository;
    private final FliItemRepository fliItemRepository;
    private final StoreRepository storeRepository;
    private final UserRepository usersRepository;
    private final S3ImageService s3ImageService;

    /**
     * fliItem 등록 요청 시 처리 로직
     * @param dto
     */
    public void registerFli(FliRequestDTO dto) {
        // --- fli_user 처리 ---
        Optional<FliUser> fliUserOptional = fliUserRepository.findById(dto.getUserId());
        FliUser fliUser;
        if (fliUserOptional.isPresent()) {
            // 존재하면 정보 업데이트 (은행, 계좌번호, 계좌 소유자)
            fliUser = fliUserOptional.get();
            fliUser.setBank(dto.getUserBank());
            fliUser.setAccountNumber(dto.getUserAccount());
            fliUser.setAccountName(dto.getAccountName());
        } else {
            // 없으면 Users 엔티티를 조회하여 새 fli_user 생성
            Users user = usersRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));
            fliUser = FliUser.builder()
                    .bank(dto.getUserBank())
                    .accountNumber(dto.getUserAccount())
                    .accountName(dto.getAccountName())
                    .user(user)
                    .build();
            fliUserRepository.save(fliUser);
        }

        // --- fli_item 처리 ---
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new StoreNotFoundException(dto.getStoreId()));
        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));

        // FliItem 엔티티 생성
        String imageUrl = s3ImageService.Base64toImageUrl(dto.getImageUrl());
        FliItem fliItem = FliItem.builder()
                .store(store)
                .users(user)
                .fliItemName(dto.getItemName())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .sectionId(dto.getSectionNumber())
                .status(FliItemStatus.PENDING)
                .applicationDate(dto.getStartDate())
                .expirationDate(dto.getStartDate().plusDays(dto.getExpirationDate()))
                .imagePath(imageUrl)
                .build();

        fliItemRepository.save(fliItem);
    }

    /**
     * 플리 상품 승인 로직
     * @param dto
     */
    public void checkFli(FliCheckDTO dto) {
        Optional<FliItem> fliItem = fliItemRepository.findByStore_StoreNoAndUsers_UserNoAndFliItemName(dto.getStoreId(), dto.getUserId(), dto.getItemName());
        FliItem item;
        if(fliItem.isPresent()) {
            item = fliItem.get();
            item.setStatus(FliItemStatus.APPROVED);
        }
    }

    /**
     * 플리 상품 거절 로직
     * @param dto
     */
    public void rejectFli(FliCheckDTO dto) {
        Optional<FliItem> fliItem = fliItemRepository.findByStore_StoreNoAndUsers_UserNoAndFliItemName(dto.getStoreId(), dto.getUserId(), dto.getItemName());
        FliItem item;
        if(fliItem.isPresent()) {
            item = fliItem.get();
            item.setStatus(FliItemStatus.REJECTED);
        }
    }

    public List<FliResponseDTO> listFli(String userEmail) {
        Store store = storeRepository.findStoreByUser_Email(userEmail);
        if(store == null) {
            throw new StoreNotFoundException(store.getStoreNo());
        }
        return fliItemRepository.findPendingFliResponseByStoreId(store.getStoreNo());
    }
}

