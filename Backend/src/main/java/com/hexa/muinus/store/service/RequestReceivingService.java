package com.hexa.muinus.store.service;

import com.hexa.muinus.common.exception.item.ItemNotFoundException;
import com.hexa.muinus.common.exception.store.StoreNotFoundException;
import com.hexa.muinus.common.exception.user.UserNotFoundException;
import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.store.domain.item.RequestReceiving;
import com.hexa.muinus.store.domain.item.RequestReceivingId;
import com.hexa.muinus.store.domain.item.repository.ItemRepository;
import com.hexa.muinus.store.domain.item.repository.RequestReceivingRepository;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.domain.item.Item;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.store.dto.item.ItemResponseDTO;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.hexa.muinus.common.exception.APIErrorCode.STORE_NOT_FORBIDDEN;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestReceivingService {

    private final RequestReceivingRepository requestReceivingRepository;
    private final StoreRepository storeRepository;
    private final ItemRepository itemRepository;
    private final UserRepository usersRepository;
    private final JwtProvider jwtProvider;


    public RequestReceiving createRequestReceiving(int userId, int storeId, int itemId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(storeId));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        RequestReceivingId id = RequestReceivingId.builder()
                .storeNo(storeId)
                .itemId(itemId)
                .userNo(userId)
                .build();

        RequestReceiving requestReceiving = RequestReceiving.builder()
                .id(id)
                .store(store)
                .item(item)
                .user(user)
                .build();

        return requestReceivingRepository.save(requestReceiving);
    }

    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemRequestCounts(HttpServletRequest request) {
        String email = jwtProvider.getUserEmailFromAccessToken(request);
        Store store = storeRepository.findStoreByUser_Email(email);
        if(store == null) {
            throw new StoreNotFoundException(store.getStoreNo());
        }
        return requestReceivingRepository.findItemRequestCountsByStoreNo(store.getStoreNo());
    }
}

