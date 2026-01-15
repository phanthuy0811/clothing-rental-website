package com.laptrinhweb.laptrinhweb.dto.response;


import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class ProductResponse {
    private long id;
    private String name;
    private int categoryId;
    private String categoryName;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
}
