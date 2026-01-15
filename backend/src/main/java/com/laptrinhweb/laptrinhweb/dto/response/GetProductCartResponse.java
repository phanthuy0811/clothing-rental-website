package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetProductCartResponse {
    private int cartProductId;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String size;
    private int quantity;
    private String imageUrl;
}
