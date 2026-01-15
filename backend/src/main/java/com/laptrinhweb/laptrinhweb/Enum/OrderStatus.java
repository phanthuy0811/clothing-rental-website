package com.laptrinhweb.laptrinhweb.Enum;

import java.util.Optional;

public enum OrderStatus {
    PENDING("Chưa thanh toán"),
    PARTIALLY_PAID("Đã đặt cọc"),
    PAID("Đã thanh toán"),
    RETURNING("Đang trả hàng"),
    CANCELLED("Đã hủy"),
    RETURNED("Đã trả hàng");


    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
