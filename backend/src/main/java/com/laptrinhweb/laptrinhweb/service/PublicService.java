package com.laptrinhweb.laptrinhweb.service;

//import com.laptrinhweb.laptrinhweb.converter.UserMapper;
import com.laptrinhweb.laptrinhweb.dto.request.LoginRequest;
import com.laptrinhweb.laptrinhweb.dto.request.UserCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.entity.*;
import com.laptrinhweb.laptrinhweb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
//    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final WalletRepository walletRepository;
    private final SearchRepository searchRepository;
    private final ItemRepository itemRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository.findByUserName(loginRequest.getUserName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());

        if (!authenticated) {
            throw new RuntimeException("Invalid password");
        }

        var token = tokenService.generateToken(user);
        return LoginResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public UserResponse signUp(UserCreationRequest userCreationRequest) {
        if(userRepository.existsByUserName(userCreationRequest.getUserName()))
            throw new RuntimeException("Username already exists");

        UserEntity userEntity = UserEntity.builder()
                .userName(userCreationRequest.getUserName())
                .password(passwordEncoder.encode(userCreationRequest.getPassword()))
                .email(userCreationRequest.getEmail())
                .fullName(userCreationRequest.getFullName())
                .build();

        userEntity.setPassword(passwordEncoder.encode(userCreationRequest.getPassword()));

        var userRole = roleRepository.findById("USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));
        userEntity.setRoles(Set.of(userRole));

        userRepository.save(userEntity);

        CartEntity cartEntity = new CartEntity();
        cartEntity.setUser(userEntity);
        cartRepository.save(cartEntity);

        WalletEntity wallet = new WalletEntity();
        wallet.setUser(userEntity);
        wallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(wallet);

        return UserResponse.builder()
                .id(userEntity.getId())
                .roles(Set.of(userRole))
                .avatarUrl(userEntity.getAvatarUrl())
                .phone(userEntity.getPhone())
                .fullName(userEntity.getFullName())
                .email(userEntity.getEmail())
                .userName(userEntity.getUserName())
                .build();
    }

    public ProductResponse getProductById(Long id) {
        ProductEntity productEntity = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        return ProductResponse.builder()
                .id(productEntity.getId())
                .imageUrl(productEntity.getImageUrl())
                .categoryId(productEntity.getCategory().getId())
                .categoryName(productEntity.getCategory().getName())
                .price(productEntity.getPrice())
                .quantity(productEntity.getQuantity())
                .name(productEntity.getName())
                .build();
    }

    public Page<ProductResponse> getAllProducts(int page) {
        int defaultSize = 8;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "id"));
        Page<ProductEntity> productPage = productRepository.findAll(pageable);

        return productPage.map(productEntity ->
                ProductResponse.builder()
                        .id(productEntity.getId())
                        .imageUrl(productEntity.getImageUrl())
                        .categoryId(productEntity.getCategory().getId())
                        .categoryName(productEntity.getCategory().getName())
                        .price(productEntity.getPrice())
                        .quantity(productEntity.getQuantity())
                        .name(productEntity.getName())
                        .build()
        );
    }


    public List<CategoryResponse> getAllCategory(){
        return categoryRepository.findAll().stream().map(categoryEntity -> CategoryResponse.builder()
                .id(categoryEntity.getId())
                .name(categoryEntity.getName())
                .imageUrl(categoryEntity.getImageUrl())
                .build()
        ).toList();
    }

    public Page<ProductResponse> getAllProductByCategory(Long categoryId, int page) {
        int defaultSize = 8;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<ProductEntity> productPage = productRepository.findByCategory_id(categoryId, pageable);

        return productPage.map(product -> ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .quantity(product.getQuantity())
                .build()
        );
    }


    public Page<CommentResponse> getAllCommentByProduct(Long productId, int page) {
        int defaultSize = 3;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.ASC, "id"));

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Page<CommentEntity> commentsPage = commentRepository.findByProduct(product, pageable);

        return commentsPage.map(comment -> CommentResponse.builder()
                .username(comment.getUser().getUserName())
                .commentId(comment.getId())
                .commentText(comment.getCommentText())
                .productId(product.getId())
                .createdAt(comment.getCreatedAt())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .build()
        );
    }



    public Page<SearchResponse> searchProduct(String keyword, int page) {
        int defaultSize = 1;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.ASC, "id"));

        Page<ProductEntity> productPage = searchRepository.searchProducts(keyword, pageable);

        return productPage.map(productEntity -> SearchResponse.builder()
                .productName(productEntity.getName())
                .categoryName(productEntity.getCategory().getName())
                .price(productEntity.getPrice())
                .imageUrl(productEntity.getImageUrl())
                .build()
        );
    }

    public ItemResponse getItemById(Long productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        ItemEntity item = itemRepository.findByProduct(product)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        return ItemResponse.builder()
                .productId(item.getProduct().getId())
                .S(item.getS())
                .L(item.getL())
                .M(item.getM())
                .XL(item.getXL())
                .build();
    }

}
