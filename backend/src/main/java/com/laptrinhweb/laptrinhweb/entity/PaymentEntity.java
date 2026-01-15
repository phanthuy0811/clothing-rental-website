package com.laptrinhweb.laptrinhweb.entity;

import com.laptrinhweb.laptrinhweb.Enum.PaymentStatus;
import com.laptrinhweb.laptrinhweb.Enum.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid; // Số tiền thanh toán

    @Column(name = "payment_date")
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private PaymentType paymentType; // LOAI_THANH_TOAN: DEPOSIT hoặc FULL_PAYMENT
}
