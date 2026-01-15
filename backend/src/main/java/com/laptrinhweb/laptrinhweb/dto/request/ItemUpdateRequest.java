package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemUpdateRequest {
    private long productId;
    private String size;
    private int quantity;
}
