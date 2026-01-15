package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemResponse {
    private long productId;

    private int S;
    private int M;
    private int L;
    private int XL;
}
