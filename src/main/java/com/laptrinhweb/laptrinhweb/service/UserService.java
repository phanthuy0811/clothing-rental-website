package com.laptrinhweb.laptrinhweb.service;

//import com.laptrinhweb.laptrinhweb.converter.UserMapper;
import com.laptrinhweb.laptrinhweb.dto.request.AddCartRequest;
import com.laptrinhweb.laptrinhweb.dto.request.CommentRequest;
import com.laptrinhweb.laptrinhweb.dto.request.UpdateProfileRequest;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.entity.*;
import com.laptrinhweb.laptrinhweb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
//    private final UserMapper userMapper;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartProductRepository cartProductRepository;
    private final CommentRepository commentRepository;
    private final CloudinaryService cloudinaryService;
    private final WalletRepository walletRepository;
    private final ItemRepository itemRepository;


    public UserResponse getMyInfo(){
        var contex = SecurityContextHolder.getContext();
        String name = contex.getAuthentication().getName();
        UserEntity user = userRepository.findByUserName(name).orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles())
                .build();
    }

    public UserResponse updateProfile(UpdateProfileRequest updateProfileRequest , MultipartFile image) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        UserEntity user = userRepository.findByUserName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updateProfileRequest != null) {
            if (updateProfileRequest.getFullName() != null) {
                user.setFullName(updateProfileRequest.getFullName());
            }
            if (updateProfileRequest.getEmail() != null) {
                user.setEmail(updateProfileRequest.getEmail());
            }
            if (updateProfileRequest.getPhone() != null) {
                user.setPhone(updateProfileRequest.getPhone());
            }
            // Nếu có URL avatar từ Cloudinary được gửi về, cập nhật vào user
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        if (imageUrl != null) {
            user.setAvatarUrl(imageUrl);
        }

        userRepository.save(user);

        return UserResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles())
                .build();
    }


    public AddCartResponse addCart(AddCartRequest addCartRequest) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartEntity cartEntity = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));


        ProductEntity product = productRepository.findById(addCartRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartProductEntity> exiting = cartProductRepository.findByCartAndProductAndSize(cartEntity , product , addCartRequest.getSize());

        CartProductEntity cartProductEntity;
        if(exiting.isPresent()){
            cartProductEntity = exiting.get();
            cartProductEntity.setQuantity(cartProductEntity.getQuantity() + addCartRequest.getQuantity());
            cartProductRepository.save(cartProductEntity);
        }else{

            cartProductEntity = CartProductEntity.builder()
                    .cart(cartEntity)
                    .product(product)
                    .size(addCartRequest.getSize())
                    .quantity(addCartRequest.getQuantity())
                    .build();
            cartProductRepository.save(cartProductEntity);
        }

        return new AddCartResponse(cartProductEntity.getId(),product.getId(), cartProductEntity.getSize(), cartProductEntity.getQuantity());
    }


    public List<GetProductCartResponse> getAllProductCart(){
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔹 Lấy giỏ hàng của user, nếu chưa có giỏ hàng thì trả về danh sách rỗng
        CartEntity cart = cartRepository.findByUser_Id(user.getId())
                .orElse(null);

        if (cart == null) {
            return new ArrayList<>(); // Trả về danh sách rỗng nếu user chưa có giỏ hàng
        }

        // Lấy danh sách sản phẩm trong giỏ hàng
        List<CartProductEntity> cartProducts = cart.getCartProducts();

        // Ánh xạ dữ liệu sang GetProductCartResponse
        return cartProducts.stream()
                .map(cartProduct -> new GetProductCartResponse(
                        cartProduct.getId(),
                        cartProduct.getProduct().getId(),
                        cartProduct.getProduct().getName(),
                        cartProduct.getProduct().getPrice(),
                        cartProduct.getSize(),
                        cartProduct.getQuantity(),
                        cartProduct.getProduct().getImageUrl()
                ))
                .collect(Collectors.toList());

    }

    public void deleteCartProduct(Long cartProductId){
        cartProductRepository.deleteById(cartProductId);
    }


    public CommentResponse addComment(CommentRequest commentRequest) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProductEntity product = productRepository.findById(commentRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CommentEntity commentEntity = new CommentEntity();
        commentEntity.setUser(user);
        commentEntity.setProduct(product);
        commentEntity.setCommentText(commentRequest.getComment());

        commentRepository.save(commentEntity);

        return CommentResponse.builder()
                .commentId(commentEntity.getId())
                .username(username)
                .createdAt(commentEntity.getCreatedAt())
                .productId(commentEntity.getProduct().getId())
                .commentText(commentEntity.getCommentText())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }



    public WalletResponse getWallet() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WalletEntity walletEntity = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        return WalletResponse.builder()
                .walletId(walletEntity.getId())
                .userName(user.getUserName())
                .balance(walletEntity.getBalance())
                .build();
    }


}
