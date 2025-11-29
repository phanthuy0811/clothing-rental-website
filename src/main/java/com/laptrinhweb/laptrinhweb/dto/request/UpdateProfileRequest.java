package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String phone;
//    private String avatar;
}
