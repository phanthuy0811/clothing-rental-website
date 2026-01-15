package com.laptrinhweb.laptrinhweb.service;

//import com.laptrinhweb.laptrinhweb.converter.UserMapper;
import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import com.laptrinhweb.laptrinhweb.dto.request.*;
import com.laptrinhweb.laptrinhweb.dto.response.*;
import com.laptrinhweb.laptrinhweb.entity.*;
import com.laptrinhweb.laptrinhweb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
//    private final UserMapper userMapper;
    private final ProductRepository productRepository;
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final CommentRepository commentRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    public Page<UserResponse> getAllUsers(int page) {
        int defaultSize = 10;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "id"));
        Page<UserEntity> users = userRepository.findAll(pageable);

        return users.map(user -> UserResponse.builder()
                .id(user.getId())
                .avatarUrl(user.getAvatarUrl())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userName(user.getUserName())
                .fullName(user.getUserName())
                .roles(user.getRoles())
                .build());
    }


    public ProductResponse createProduct(ProductCreationRequest request, MultipartFile image) {
        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product already exists");
        }

        CategoryEntity categoryEntity = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Upload image lên Cloudinary
        String imageUrl = cloudinaryService.uploadImage(image);

        // Chuyển request thành entity và lưu vào database
        ProductEntity productEntity = ProductEntity.builder()
                .name(request.getName())
                .price(request.getPrice())
                .category(categoryEntity)
                .imageUrl(imageUrl)
                .quantity(0)
                .build();

        productEntity = productRepository.save(productEntity);

        // Tạo ItemEntity với số lượng mặc định là 0
        ItemEntity itemEntity = ItemEntity.builder()
                .product(productEntity)
                .S(0).M(0).L(0).XL(0)
                .build();

        itemRepository.save(itemEntity);

        return ProductResponse.builder()
                .id(productEntity.getId())
                .imageUrl(imageUrl)
                .categoryId(categoryEntity.getId())
                .categoryName(categoryEntity.getName())
                .price(productEntity.getPrice())
                .quantity(0)
                .name(productEntity.getName())
                .build();
    }


    public void deleteProduct(Long id) {

        ItemEntity item = itemRepository.findByProduct(productRepository.findById(id).get())
                        .orElseThrow(null);
        itemRepository.deleteById(item.getId());
        productRepository.deleteById(id);
    }

    public ProductResponse updateProduct(Long productId, ProductUpdateRequest productUpdateRequest, MultipartFile image) {
        ProductEntity productEntity = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CategoryEntity categoryEntity = categoryRepository.findById(productUpdateRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Nếu có ảnh mới thì upload lên Cloudinary
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        // Cập nhật thông tin sản phẩm
        if (productUpdateRequest.getName() != null) {
            productEntity.setName(productUpdateRequest.getName());
        }
        if (productUpdateRequest.getCategoryId() != null) {
            productEntity.setCategory(categoryEntity);
        }
        if (productUpdateRequest.getPrice() != null) {
            productEntity.setPrice(productUpdateRequest.getPrice());
        }
        if (imageUrl != null) {
            productEntity.setImageUrl(imageUrl);
        }

        productRepository.save(productEntity);

        // Trả về ProductResponse
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



    public ItemResponse updateItem(ItemUpdateRequest request) {
        // Lấy sản phẩm từ productId
        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Lấy item từ productId
        ItemEntity itemEntity = itemRepository.findByProduct(product)
                .orElseThrow(() -> new RuntimeException("Item not found for this product"));

        // Cập nhật số lượng theo size
        switch (request.getSize().toUpperCase()) {
            case "S":
                itemEntity.setS(itemEntity.getS() + request.getQuantity());
                break;
            case "M":
                itemEntity.setM(itemEntity.getM() + request.getQuantity());
                break;
            case "L":
                itemEntity.setL(itemEntity.getL() + request.getQuantity());
                break;
            case "XL":
                itemEntity.setXL(itemEntity.getXL() + request.getQuantity());
                break;
            default:
                throw new IllegalArgumentException("Invalid size: " + request.getSize());
        }

        product.setQuantity(product.getQuantity() + request.getQuantity());
        productRepository.save(product);
        // Lưu thay đổi vào database
        itemRepository.save(itemEntity);

        // Trả về phản hồi
        return ItemResponse.builder()
                .productId(product.getId())
                .S(itemEntity.getS())
                .M(itemEntity.getM())
                .L(itemEntity.getL())
                .XL(itemEntity.getXL())
                .build();
    }

    public Page<ItemResponse> getAllItems(int page) {
        int defaultSize = 10;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "id"));
        Page<ItemEntity> itemsPage = itemRepository.findAll(pageable);

        return itemsPage.map(item -> ItemResponse.builder()
                .productId(item.getProduct().getId())
                .S(item.getS())
                .M(item.getM())
                .L(item.getL())
                .XL(item.getXL())
                .build());
    }




    public CategoryResponse createCategory(CreateCategoryRequest createCategoryRequest , MultipartFile image){
        if(categoryRepository.existsByName(createCategoryRequest.getName())){
            throw new RuntimeException("Category already exists");
        }

        String imageUrl = cloudinaryService.uploadImage(image);

        CategoryEntity categoryEntity = CategoryEntity.builder()
                .name(createCategoryRequest.getName())
                .imageUrl(imageUrl)
                .build();

        categoryRepository.save(categoryEntity);
        return CategoryResponse.builder()
                .id(categoryEntity.getId())
                .name(categoryEntity.getName())
                .imageUrl(categoryEntity.getImageUrl())
                .build();
    }


    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    public CategoryResponse getCategoryById(Long id){
        CategoryEntity categoryEntity = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

        return CategoryResponse.builder()
                .id(categoryEntity.getId())
                .name(categoryEntity.getName())
                .imageUrl(categoryEntity.getImageUrl())
                .build();
    }

    public CategoryResponse updateCategory(Long id ,CategoryRequest categoryRequest , MultipartFile image){
        CategoryEntity categoryEntity = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

        if(categoryRequest.getName() != null){
            categoryEntity.setName(categoryRequest.getName());
        }
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        if (imageUrl != null) {
            categoryEntity.setImageUrl(imageUrl);
        }
        categoryRepository.save(categoryEntity);
        return CategoryResponse.builder()
                .id(categoryEntity.getId())
                .name(categoryEntity.getName())
                .imageUrl(categoryEntity.getImageUrl())
                .build();
    }


    public Page<CommentResponse> getAllCommentByProductName(String productName, int page) {
        int defaultSize = 10;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.ASC, "id"));

        ProductEntity product = productRepository.findByName(productName)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Page<CommentEntity> parentComments = commentRepository.findByProduct(product, pageable);

        return parentComments.map(parentComment -> CommentResponse.builder()
                .commentId(parentComment.getId())
                .productId(product.getId())
                .createdAt(parentComment.getCreatedAt())
                .commentText(parentComment.getCommentText())
                .username(parentComment.getUser().getUserName())
                .avatarUrl(parentComment.getUser().getAvatarUrl())
                .build());
    }


    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }



    public List<UserResponse> searchUser(String keyword){
        return userRepository.searchUsers(keyword).stream().map(
                userEntity ->
                        UserResponse.builder()
                                .id(userEntity.getId())
                                .userName(userEntity.getUserName())
                                .fullName(userEntity.getFullName())
                                .phone(userEntity.getPhone())
                                .email(userEntity.getEmail())
                                .avatarUrl(userEntity.getAvatarUrl())
                                .roles(userEntity.getRoles())
                                .build())
                .toList();
    }



    public Page<OrderResponse> getAllOrders(int page, String statusText) {
        int defaultSize = 10;
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "orderDate"));

        Optional<OrderStatus> statusOptional = Optional.empty();
        if (statusText != null && !statusText.isBlank()) {
            try {
                // Chuyển trực tiếp statusText thành enum OrderStatus (theo tên enum, case-sensitive)
                statusOptional = Optional.of(OrderStatus.valueOf(statusText));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ: " + statusText);
            }
        }

        Page<OrderEntity> orderPage;
        if (statusOptional.isPresent()) {
            orderPage = orderRepository.findByOrderStatus(statusOptional.get(), pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        return orderPage.map(order -> {
            List<OrderDetailEntity> orderDetailEntities = orderDetailRepository.findByOrder(order);

            List<OrderDetailResponse> orderDetails = orderDetailEntities.stream()
                    .map(detail -> OrderDetailResponse.builder()
                            .productId(detail.getProduct().getId())
                            .productName(detail.getProduct().getName())
                            .size(detail.getSize())
                            .quantity(detail.getQuantity())
                            .price(detail.getPrice())
                            .imageUrl(detail.getProduct().getImageUrl())
                            .build())
                    .collect(Collectors.toList());

            LocalDate startDate = null;
            LocalDate endDate = null;
            if (!orderDetailEntities.isEmpty()) {
                startDate = orderDetailEntities.get(0).getStartDate();
                endDate = orderDetailEntities.get(0).getEndDate();
            }

            UserEntity user = userRepository.findById((long) order.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return OrderResponse.builder()
                    .orderId(order.getId())
                    .userFullName(user.getFullName())
                    .totalPrice(order.getTotalPrice())
                    .orderDate(order.getOrderDate())
                    .orderStatus(order.getOrderStatus().getDisplayName())
                    .startDate(startDate)
                    .endDate(endDate)
                    .orderDetails(orderDetails)
                    .build();
        });
    }


    public Boolean confirmReturned(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.RETURNING) {
            throw new RuntimeException("Chỉ có thể xác nhận với đơn hàng đang trong quá trình trả");
        }

        order.setOrderStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        return true;
    }


}
