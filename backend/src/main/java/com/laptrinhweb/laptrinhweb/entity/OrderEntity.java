package com.laptrinhweb.laptrinhweb.entity;

import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity user;

    @Column(name = "order_date", updatable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(name = "price", precision = 10, scale = 2) // precision: tổng số chữ số, scale: số chữ số sau dấu phẩy
    private BigDecimal totalPrice;

    @Column(name = "outstanding_Amount", precision = 10, scale = 2) // precision: tổng số chữ số, scale: số chữ số sau dấu phẩy
    private BigDecimal outstandingAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus orderStatus;  // Lưu trạng thái đơn hàng

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentEntity> payments = new ArrayList<>();

    private String name;
    private String phone;
    private String address;
}
