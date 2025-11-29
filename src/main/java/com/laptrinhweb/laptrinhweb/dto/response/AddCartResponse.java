package com.laptrinhweb.laptrinhweb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddCartResponse {
    private int cartProductId;
    private Long productId;
    private String size;
    private int quantity;
}
