package com.laptrinhweb.laptrinhweb.dto.response;

import com.laptrinhweb.laptrinhweb.entity.Role;
import lombok.*;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class UserResponse {
    private int id;
    private String userName;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Set<Role> roles;
}
