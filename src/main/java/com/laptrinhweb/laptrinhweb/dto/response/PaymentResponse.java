package com.laptrinhweb.laptrinhweb.dto.response;

import com.laptrinhweb.laptrinhweb.Enum.PaymentStatus;
import com.laptrinhweb.laptrinhweb.Enum.PaymentType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {
    private Long orderId;
    private PaymentType paymentType;
    private BigDecimal amountPaid;
    private BigDecimal outstandingAmount;
}
