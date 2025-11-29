package com.laptrinhweb.laptrinhweb.controller;

import com.laptrinhweb.laptrinhweb.dto.api.ApiResponse;
import com.laptrinhweb.laptrinhweb.dto.request.*;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/user")
    Page<UserResponse> getUsers(@RequestParam (defaultValue = "0") int page) {
        return adminService.getAllUsers(page);
    }

    @PostMapping("/create-product")
    public ApiResponse<ProductResponse> createProduct(
            @RequestPart("product") ProductCreationRequest productCreationRequest,
            @RequestPart("image") MultipartFile image) {

        return ApiResponse.<ProductResponse>builder()
                .result(adminService.createProduct(productCreationRequest, image))
                .build();
    }


    @DeleteMapping("/delete-product/{productId}")
    ApiResponse<Boolean> deleteProduct(@PathVariable Long productId) {
        adminService.deleteProduct(productId);
        return ApiResponse.<Boolean>builder()
                .result(true)
                .build();
    }

    @PutMapping("/update-product/{productId}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestPart("product") ProductUpdateRequest productUpdateRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ApiResponse.<ProductResponse>builder()
                .result(adminService.updateProduct(productId, productUpdateRequest, image))
                .build();
    }


    @PutMapping("/update-item")
    ApiResponse<ItemResponse> updateItem(@RequestBody ItemUpdateRequest itemUpdateRequest) {
        return ApiResponse.<ItemResponse>builder()
                .result(adminService.updateItem(itemUpdateRequest))
                .build();
    }

    @GetMapping("/all-item")
    Page<ItemResponse> getAllItems(@RequestParam(defaultValue = "0") int page ) {
        return adminService.getAllItems(page);
    }


    @PostMapping("/create-category")
    ApiResponse<CategoryResponse> createCategory(
            @RequestPart("category") CreateCategoryRequest createCategoryRequest,
            @RequestPart("image") MultipartFile image){

        return ApiResponse.<CategoryResponse>builder()
                .result(adminService.createCategory(createCategoryRequest, image))
                .build();
    }


    @DeleteMapping("/delete-category/{categoryId}")
    ApiResponse<Boolean> deleteCategory(@PathVariable Long categoryId){
        adminService.deleteCategory(categoryId);
        return ApiResponse.<Boolean>builder()
                .result(true)
                .build();
    }

    @GetMapping("/get-category/{categoryId}")
    ApiResponse<CategoryResponse> getCategory(@PathVariable Long categoryId){
        return ApiResponse.<CategoryResponse>builder()
                .result(adminService.getCategoryById(categoryId))
                .build();
    }

    @PutMapping("/update-category/{categoryId}")
    ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @RequestPart("category") CategoryRequest categoryRequest,
            @RequestPart(value = "image", required = false) MultipartFile image){
        return ApiResponse.<CategoryResponse>builder()
                .result(adminService.updateCategory(categoryId, categoryRequest, image))
                .build();
    }

    @GetMapping("/all-comment-by-productName")
    Page<CommentResponse> getAllCommentsByProductName(@RequestParam String productName,@RequestParam(defaultValue = "0") int page) {
        return adminService.getAllCommentByProductName(productName,page);
    }

    @DeleteMapping("/delete-comment/{commentId}")
    ApiResponse<Boolean> deleteComment(@PathVariable Long commentId){
        adminService.deleteComment(commentId);
        return ApiResponse.<Boolean>builder()
                .result(true)
                .build();
    }

    @GetMapping("/search-user")
    ApiResponse<List<UserResponse>> searchUser(@RequestParam String keyword) {
        return ApiResponse.<List<UserResponse>>builder()
                .result(adminService.searchUser(keyword))
                .build();
    }

    @GetMapping("/get-all-order-admin")
    public Page<OrderResponse> getAllOrder(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String statusText) {
        return adminService.getAllOrders(page, statusText);
    }

    @PostMapping("/returned")
    ApiResponse<Boolean> confirm(@RequestParam Long orderId) {
        return ApiResponse.<Boolean>builder()
                .result(adminService.confirmReturned(orderId))
                .build();
    }

}
