package com.laptrinhweb.laptrinhweb.dto.response;

import com.laptrinhweb.laptrinhweb.Enum.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletResponse {
    private int walletId;
    private String userName;
    private BigDecimal balance;
}
