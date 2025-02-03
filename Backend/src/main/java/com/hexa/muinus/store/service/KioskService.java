package com.hexa.muinus.store.service;

import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.store.domain.item.FliItem;
import com.hexa.muinus.store.domain.item.Item;
import com.hexa.muinus.store.domain.item.StoreItem;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.domain.transaction.GuestTransactionDetails;
import com.hexa.muinus.store.domain.transaction.GuestTransactions;
import com.hexa.muinus.store.domain.transaction.TransactionDetails;
import com.hexa.muinus.store.domain.transaction.Transactions;
import com.hexa.muinus.store.dto.kiosk.PaymentRequestDTO;
import com.hexa.muinus.store.dto.kiosk.PaymentResponseDTO;
import com.hexa.muinus.store.dto.kiosk.PutFliItemResponseDTO;
import com.hexa.muinus.store.dto.kiosk.ScanBarcodeResponseDTO;
import com.hexa.muinus.users.domain.user.GuestUser;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.service.GuestUserService;
import com.hexa.muinus.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KioskService {

    private final JwtProvider jwtProvider;
    private final UserService userService;
    private final GuestUserService guestUserService;
    private final ItemService itemService;
    private final StoreItemService storeItemService;
    private final StoreService storeService;
    private final FliItemService fliItemService;
    private final GuestTransactionsService guestTransactionsService;
    private final GuestTransactionDetailsService guestTransactionDetailsService;
    private final TransactionDetailsService transactionDetailsService;
    private final TransactionsService transactionsService;

    @Transactional(readOnly = true)
    public ScanBarcodeResponseDTO scanBarcode(Integer storeNo, String barcode) {
        // 바코드 번호로 item 테이블에서 상품 번호 및 이름 조회
        Item item = itemService.findItemByBarcode(barcode);
        Store store = storeService.findStoreByStoreNo(storeNo);

        // storeNo, itemNo로 store_item 테이블에서 상품 가격 조회
        Integer price = storeItemService.findStoreItemByStoreAndItem(store, item).getSalePrice();

        return ScanBarcodeResponseDTO.builder()
                .itemName(item.getItemName())
                .price(price)
                .build();
    }

    @Transactional(readOnly = true)
    public PutFliItemResponseDTO putFliItem(Integer storeNo, Integer sectionId) {
        Store store = storeService.findStoreByStoreNo(storeNo);
        FliItem fliItem = fliItemService.findFliItemByStoreAndSectionId(store, sectionId);

        return PutFliItemResponseDTO.builder()
                .itemName(fliItem.getFliItemName())
                .price(fliItem.getPrice())
                .build();
    }

    @Transactional
    public PaymentResponseDTO payForItems(PaymentRequestDTO requestDTO, HttpServletRequest request) {
        String receiptCode = UUID.randomUUID().toString();
        String userEmail = jwtProvider.getUserEmailFromAccessToken(request);
        Store store = storeService.findStoreByStoreNo(requestDTO.getStoreNo());

        // 회원 결제
        if (userEmail != null) {
            processPaymentForUser(userEmail, receiptCode, store, requestDTO);
        }

        // 비회원 결제
        else if (userEmail == null) {
            processPaymentForGuestUser(receiptCode, store, requestDTO);
        }

        return PaymentResponseDTO.builder()
                .receiptCode(receiptCode)
                .build();
    }

    // transactions 테이블에 receipt_code, store_no, user_no, totalAmount, status 저장
    // transaction_detail 테이블 -> transaction_id, store_item_id, unit_price, quantity, sub_total
    @Transactional
    protected void processPaymentForUser(String userEmail, String receiptCode, Store store, PaymentRequestDTO requestDTO) {
        Users user = userService.findUserByEmail(userEmail);
        Transactions transactions = Transactions.create(receiptCode, store, user, requestDTO);
        transactionsService.save(transactions);

        for (int i=0;i<requestDTO.getItemsForPayment().size();i++) {
            Item item = itemService.getItem(requestDTO.getItemsForPayment().get(i).getItemId());
            StoreItem storeItem = storeItemService.findStoreItemByStoreAndItem(store, item);
            TransactionDetails transactionDetails = TransactionDetails.create(transactions, storeItem, requestDTO, i);
            transactionDetailsService.save(transactionDetails);
        }

        /**
         * 플리마켓 상품 결제 시 결제 내역을 어떻게 저장할 것인지?
         * 현재 transaction_deatils 테이블에 store_item_id는 있지만 fli_item_id가 없어서 둘이 구분 불가
         */
//            for (int i=0;i<requestDTO.getFliItemsForPayment().size();i++) {
//                FliItem fliItem = fliItemService.findFliItemByStoreAndFliItemId(store, requestDTO.getFliItemsForPayment().get(i).getFliItemId());
//                TransactionDetails transactionDetails = TransactionDetails.builder()
//                        .transaction(transactions)
//                        .storeItem(fliItem)
//                        .unitPrice(requestDTO.getFliItemsForPayment().get(i).getPrice())
//                        .quantity(requestDTO.getFliItemsForPayment().get(i).getQuantity())
//                        .subTotal(requestDTO.getFliItemsForPayment().get(i).getSubtotal())
//                        .build();
//
//                transactionDetailsRepository.save(transactionDetails);
//            }
    }

    // guest 테이블에 guest_name 저장
    // guest_transactions 테이블 -> receipt_code, store_no, guest_no, total_amount, status
    // guest_transaction_detail 테이블 -> transaction_id, store_item_id, unit_price, quantity, sub_total
    @Transactional
    protected void processPaymentForGuestUser(String receiptCode, Store store, PaymentRequestDTO requestDTO) {
        GuestUser guestUser = GuestUser.builder().guestName(UUID.randomUUID().toString()).build();
        guestUserService.save(guestUser);

        GuestTransactions guestTransactions = GuestTransactions.create(receiptCode, store, guestUser, requestDTO);
        guestTransactionsService.save(guestTransactions);

        // 비회원 결제 후 일반 판매 상품 결제 기록 저장
        for (int i=0;i<requestDTO.getItemsForPayment().size();i++) {
            Item item = itemService.getItem(requestDTO.getItemsForPayment().get(i).getItemId());
            StoreItem storeItem = storeItemService.findStoreItemByStoreAndItem(store, item);
            GuestTransactionDetails guestTransactionDetails = GuestTransactionDetails.create(guestTransactions, storeItem, requestDTO, i);
            guestTransactionDetailsService.save(guestTransactionDetails);
        }

        /**
         * guest_transaction_details 또한 transaction_details랑 같은 문제
         */
//            for (int i=0;i<requestDTO.getFliItemsForPayment().size();i++) {
//                FliItem fliitem = fliItemService.findFliItemByStoreAndFliItemId(store, requestDTO.getFliItemsForPayment().get(i).getFliItemId());
//                GuestTransactionDetails guestTransactionDetails = GuestTransactionDetails.builder()
//                        .transactions(guestTransactions)
//                        .storeItem(storeItem)
//                        .unitPrice(requestDTO.getFliItemsForPayment().get(i).getPrice())
//                        .quantity(requestDTO.getFliItemsForPayment().get(i).getQuantity())
//                        .subTotal(requestDTO.getFliItemsForPayment().get(i).getSubtotal())
//                        .build();
//                guestTransactionDetailsRepository.save(guestTransactionDetails);
//            }
    }
}
