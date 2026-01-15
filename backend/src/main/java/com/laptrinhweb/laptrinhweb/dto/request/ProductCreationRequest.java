package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class ProductCreationRequest {
    private String name;
    private Long categoryId;

    private BigDecimal price;
//    private String imageUrl;
}
