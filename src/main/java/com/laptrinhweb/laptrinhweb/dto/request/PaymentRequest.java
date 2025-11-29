package com.laptrinhweb.laptrinhweb.dto.request;

import com.laptrinhweb.laptrinhweb.Enum.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private Long orderId;
    private PaymentType paymentType;
}
