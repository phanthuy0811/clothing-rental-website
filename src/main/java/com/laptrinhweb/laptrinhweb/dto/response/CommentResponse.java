package com.laptrinhweb.laptrinhweb.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponse {
    private Long commentId;
    private String username;
    private String commentText;
    private Long productId;
    private LocalDateTime createdAt;
    private String avatarUrl;
}
