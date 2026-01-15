package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class CategoryResponse {
    private int id;
    private String name;
    private String imageUrl;
}
