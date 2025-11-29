package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreationRequest {
    private String userName;
    private String password;
    private String email;
    private String fullName;
}
