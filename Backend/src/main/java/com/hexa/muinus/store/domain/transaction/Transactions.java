package com.hexa.muinus.store.domain.transaction;

import com.hexa.muinus.common.enums.TxnStatus;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.kiosk.PaymentRequestDTO;
import com.hexa.muinus.users.domain.user.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;

    @Column(name = "receipt_code", nullable = false, length = 50, unique = true)
    private String receiptCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_no", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private Users user;

    @Column(name = "total_amount", nullable = false)
    private int totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('SUCCESS', 'FAILED', 'REFUNDED')")
    private TxnStatus status = TxnStatus.SUCCESS;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private LocalDateTime createdAt;

    public static Transactions create(String receiptCode, Store store, Users user, PaymentRequestDTO requestDTO) {
        return Transactions.builder()
                .receiptCode(receiptCode)
                .store(store)
                .user(user)
                .totalAmount(requestDTO.getTotalPrice())
                .status(TxnStatus.SUCCESS)
                .build();
    }
}
