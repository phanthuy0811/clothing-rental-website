package com.laptrinhweb.laptrinhweb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeleteCommentRequest {
    private Long productId;
    private Long commentId;
}
