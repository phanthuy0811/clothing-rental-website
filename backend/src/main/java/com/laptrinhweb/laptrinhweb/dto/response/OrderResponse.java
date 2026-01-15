package com.laptrinhweb.laptrinhweb.dto.response;

import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long orderId;
    private String userFullName;
    private BigDecimal totalPrice;
    private LocalDateTime orderDate;
    private String orderStatus;
    private BigDecimal outstandingAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<OrderDetailResponse> orderDetails;
}
