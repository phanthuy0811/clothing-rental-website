package com.laptrinhweb.laptrinhweb.entity;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.userdetails.User;

import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String userName;
    private String fullName;
    private String email;
    private String password;

    private String phone;
    private String avatarUrl;
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Role> roles;


}
