package com.hexa.muinus.store.domain.transaction;

import com.hexa.muinus.store.domain.item.StoreItem;
import com.hexa.muinus.store.dto.kiosk.PaymentRequestDTO;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "guest_transaction_details",
        uniqueConstraints = {@UniqueConstraint(name = "unique_guest_transaction_details", columnNames = {"transaction_id", "store_item_id"})}
)
public class GuestTransactionDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer detailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private GuestTransactions transactions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_item_id", nullable = false)
    private StoreItem storeItem;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "sub_total", nullable = false)
    private int subTotal;

    public static GuestTransactionDetails create(GuestTransactions guestTransactions, StoreItem storeItem, PaymentRequestDTO requestDTO, int index) {
        return GuestTransactionDetails.builder()
                .transactions(guestTransactions)
                .storeItem(storeItem)
                .unitPrice(requestDTO.getItemsForPayment().get(index).getPrice())
                .quantity(requestDTO.getItemsForPayment().get(index).getQuantity())
                .subTotal(requestDTO.getItemsForPayment().get(index).getSubtotal())
                .build();
    }
}

