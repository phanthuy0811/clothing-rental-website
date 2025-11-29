package com.laptrinhweb.laptrinhweb.controller;

import com.laptrinhweb.laptrinhweb.dto.api.ApiResponse;
import com.laptrinhweb.laptrinhweb.dto.request.LoginRequest;
import com.laptrinhweb.laptrinhweb.dto.request.UserCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.entity.CommentEntity;
import com.laptrinhweb.laptrinhweb.service.AdminService;
import com.laptrinhweb.laptrinhweb.service.PublicService;
import com.laptrinhweb.laptrinhweb.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {
    @Autowired
    private final UserService userService;
    private final AdminService adminService;
    private final PublicService publicService;

    @PostMapping({"/login", "/login/"})
    ApiResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest , HttpServletResponse response) {
        var result = publicService.login(loginRequest);
        return ApiResponse.<LoginResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping({"/signup" , "/signup/"})
    ApiResponse<UserResponse> signup(@RequestBody @Valid UserCreationRequest userCreationRequest) {
        return ApiResponse.<UserResponse>builder()
                .result(publicService.signUp(userCreationRequest))
                .build();
    }

    @GetMapping("/get-product/{productId}")
    ApiResponse<ProductResponse> getProducts(@PathVariable Long productId) {
        return ApiResponse.<ProductResponse>builder()
                .result(publicService.getProductById(productId))
                .build();
    }

    @GetMapping("/all-product")
    Page<ProductResponse> getAllProducts(@RequestParam(defaultValue = "0") int page) {
        return publicService.getAllProducts(page);
    }

    @GetMapping("/all-category")
    ApiResponse<List<CategoryResponse>> getAllCategory(){
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(publicService.getAllCategory())
                .build();
    }

    @GetMapping("/product-category/{categoryId}")
    Page<ProductResponse> getAllProductByCategory(@PathVariable Long categoryId,@RequestParam(defaultValue = "0") int page){
        return publicService.getAllProductByCategory(categoryId,page);
    }

    @GetMapping("/all-comment-by-product/{productId}")
    Page<CommentResponse> getAllCommentsByProduct(@PathVariable Long productId,@RequestParam(defaultValue = "0") int page) {
        return publicService.getAllCommentByProduct(productId,page);
    }

    @GetMapping("/search")
    Page<SearchResponse> search(@RequestParam String keyword,@RequestParam(defaultValue = "0") int page) {
        return publicService.searchProduct(keyword,page);
    }


    @GetMapping("/get-item-by-id/{productId}")
    ApiResponse<ItemResponse> getItemById(@PathVariable Long productId) {
        return ApiResponse.<ItemResponse>builder()
                .result(publicService.getItemById(productId))
                .build();
    }
}
