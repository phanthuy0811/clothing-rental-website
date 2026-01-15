package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class IntrospectRequest {
    String token;
}
