package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailResponse {
    private Long productId;
    private String productName;
    private String size;
    private int quantity;
    private BigDecimal price; // Giá mỗi sản phẩm
    private String imageUrl;
}