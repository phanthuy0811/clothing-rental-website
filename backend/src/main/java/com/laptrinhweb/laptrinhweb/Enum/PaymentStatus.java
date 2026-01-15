package com.laptrinhweb.laptrinhweb.Enum;

public enum PaymentStatus {
    PENDING("Chưa thanh toán"),
    PARTIALLY_PAID("Đã thanh toán một phần"),
    PAID("Đã thanh toán");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

