package com.laptrinhweb.laptrinhweb.dto.api;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ApiResponse<T> {

    @Builder.Default
    private int code = 200;
    private T result;
}
