package com.laptrinhweb.laptrinhweb.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", referencedColumnName = "id")
    private OrderEntity order;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    private ProductEntity product;

    private String size;
    private int quantity;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(name = "price", precision = 10, scale = 2) // precision: tổng số chữ số, scale: số chữ số sau dấu phẩy
    private BigDecimal price;
}
