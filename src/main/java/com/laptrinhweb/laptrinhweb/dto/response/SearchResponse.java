package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class SearchResponse {
    private String productName;
    private String categoryName;
    private BigDecimal price;
    private String imageUrl;
}
