package com.laptrinhweb.laptrinhweb.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import org.checkerframework.checker.units.qual.N;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    String name;
    String description;
}
