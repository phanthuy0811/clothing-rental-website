package com.laptrinhweb.laptrinhweb.controller;

import com.cloudinary.Api;
import com.laptrinhweb.laptrinhweb.dto.api.ApiResponse;
import com.laptrinhweb.laptrinhweb.dto.request.*;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.service.OrderService;
import com.laptrinhweb.laptrinhweb.service.PaymentService;
import com.laptrinhweb.laptrinhweb.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final OrderService orderService;
    private final PaymentService paymentService;

    @GetMapping("/profile")
    ApiResponse<UserResponse> getMyInfo(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/update-profile")
    ApiResponse<UserResponse> updateMyInfo(
            @RequestPart("updateProfileRequest") UpdateProfileRequest updateProfileRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        UserResponse userResponse = userService.updateProfile(updateProfileRequest , image);
        return ApiResponse.<UserResponse>builder()
                .result(userResponse)
                .build();
    }

    @PostMapping("/cart")
    ApiResponse<AddCartResponse> addCart(@RequestBody AddCartRequest addCartRequest) {
        return ApiResponse.<AddCartResponse>builder()
                .result(userService.addCart(addCartRequest))
                .build();
    }

    @GetMapping("/all-product-cart")
    ApiResponse<List<GetProductCartResponse>> getAllProductCart() {
        return ApiResponse.<List<GetProductCartResponse>>builder()
                .result(userService.getAllProductCart())
                .build();
    }

    @DeleteMapping("/delete-cart-product/{cartProductId}")
    ApiResponse<Boolean> deleteCartProduct(@PathVariable Long cartProductId) {
        userService.deleteCartProduct(cartProductId);
        return ApiResponse.<Boolean>builder()
                .result(true)
                .build();
    }

    @PostMapping("/add-comment")
    ApiResponse<CommentResponse> addComment(@RequestBody CommentRequest commentRequest) {
        return ApiResponse.<CommentResponse>builder()
                .result(userService.addComment(commentRequest))
                .build();
    }


    @PostMapping("/create-order")
    ApiResponse<OrderResponse> createOrder(@RequestBody List<OrderRequest> orderRequests) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.createOrder(orderRequests))
                .build();
    }

    @PostMapping("/payment")
    ApiResponse<PaymentResponse> payment(@RequestBody PaymentRequest paymentRequest){
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.payment(paymentRequest))
                .build();
    }

    @GetMapping("/get-all-order")
    Page<OrderResponse> getAllOrder(@RequestParam(defaultValue = "0") int page){
        return orderService.getAllOrdersByUser(page);
    }

    @GetMapping("/get-wallet")
    ApiResponse<WalletResponse> getWallet(){
        return ApiResponse.<WalletResponse>builder()
                .result(userService.getWallet())
                .build();
    }

    @PostMapping("/wallet")
    ApiResponse<WalletResponse> updateWallet(@RequestBody WalletRequest walletRequest) {
        return ApiResponse.<WalletResponse>builder()
                .result(paymentService.updateWallet(walletRequest))
                .build();
    }

    @PostMapping("/withdrawal-wallet")
    ApiResponse<WalletResponse> withdrawalWallet(@RequestBody WalletRequest walletRequest) {
        return ApiResponse.<WalletResponse>builder()
                .result(paymentService.withdrawFromWallet(walletRequest))
                .build();
    }


    @PostMapping("/update-order/{orderId}")
    ApiResponse<OrderResponse> updateOrder(@PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrder(orderId))
                .build();
    }

    @GetMapping("/get-order-by-id/{orderId}")
    ApiResponse<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId))
                .build();
    }

    @PostMapping("/returning")
    ApiResponse<Boolean> giveBack(@RequestParam Long orderId) {
        return ApiResponse.<Boolean>builder()
                .result(orderService.giveBack(orderId))
                .build();
    }



}
