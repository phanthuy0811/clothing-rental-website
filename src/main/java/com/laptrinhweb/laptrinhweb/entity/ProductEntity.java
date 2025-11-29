package com.laptrinhweb.laptrinhweb.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Column(name = "price", precision = 10, scale = 2) // precision: tổng số chữ số, scale: số chữ số sau dấu phẩy
    private BigDecimal price;

    private String imageUrl;

    private int quantity;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false) // Thêm khóa ngoại
    private CategoryEntity category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartProductEntity> cartProducts;
}
