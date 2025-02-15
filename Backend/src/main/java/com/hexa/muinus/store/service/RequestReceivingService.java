package com.hexa.muinus.store.service;

import co.elastic.clients.elasticsearch.nodes.Http;
import com.hexa.muinus.common.exception.MuinusException;
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
import org.apache.commons.net.ntp.TimeStamp;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static com.hexa.muinus.common.exception.APIErrorCode.STORE_NOT_FORBIDDEN;
import static com.hexa.muinus.common.exception.APIErrorCode.USER_ALREADY_REQUESTED_ITEM;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestReceivingService {

    private final RequestReceivingRepository requestReceivingRepository;
    private final StoreRepository storeRepository;
    private final ItemRepository itemRepository;
    private final UserRepository usersRepository;
    private final JwtProvider jwtProvider;


    public RequestReceiving createRequestReceiving(HttpServletRequest request, int storeId, int itemId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(storeId));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));

        String email = jwtProvider.getUserEmailFromAccessToken(request);
        Users users = usersRepository.findByEmail(email);

        // 아이템 입고 요청 1일 1회 검증.
        checkUserAlreadyRequestedItemToday(users);

        RequestReceivingId id = RequestReceivingId.builder()
                .storeNo(storeId)
                .itemId(itemId)
                .userNo(users.getUserNo())
                .build();

        RequestReceiving requestReceiving = RequestReceiving.builder()
                .id(id)
                .store(store)
                .item(item)
                .user(users)
                .build();

        return requestReceivingRepository.save(requestReceiving);
    }

    private void checkUserAlreadyRequestedItemToday(Users user) {
        // 현재 날짜 가져오기
        LocalDate today = LocalDate.now();

        // 가장 최근 요청의 날짜 가져오기
        Timestamp lastRequestedTimestamp = requestReceivingRepository
                .findTopByUserOrderByCreatedAtDesc(user)
                .getCreatedAt();

        LocalDate lastRequestedDate = lastRequestedTimestamp.toLocalDateTime().toLocalDate();

        // 같은 날이면 예외 발생
        if (today.equals(lastRequestedDate)) {
            throw new MuinusException(USER_ALREADY_REQUESTED_ITEM);
        }
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

