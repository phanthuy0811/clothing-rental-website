package com.laptrinhweb.laptrinhweb.service;

import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import com.laptrinhweb.laptrinhweb.dto.request.OrderRequest;
import com.laptrinhweb.laptrinhweb.dto.response.OrderDetailResponse;
import com.laptrinhweb.laptrinhweb.dto.response.OrderResponse;
import com.laptrinhweb.laptrinhweb.entity.*;
import com.laptrinhweb.laptrinhweb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final WalletRepository walletRepository;

    public OrderResponse createOrder(List<OrderRequest> orderRequests) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        UserEntity user = userRepository.findByUserName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy thông tin từ sản phẩm đầu tiên (vì chỉ có 1 địa chỉ giao hàng)
        OrderRequest firstRequest = orderRequests.get(0);

        // 1️⃣ Tạo đơn hàng với giá trị mặc định là 0
        OrderEntity order = OrderEntity.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalPrice(BigDecimal.ZERO)
                .outstandingAmount(BigDecimal.ZERO)
                .orderStatus(OrderStatus.PENDING)
                .phone(firstRequest.getPhone())
                .address(firstRequest.getAddress())
                .build();
        order = orderRepository.save(order); // Lưu trước để lấy ID

        AtomicReference<BigDecimal> totalPrice = new AtomicReference<>(BigDecimal.ZERO);
        OrderEntity finalOrder = order;

        // 2️⃣ Duyệt danh sách sản phẩm để tạo OrderDetail
        List<OrderDetailEntity> orderDetails = orderRequests.stream().map(req -> {
            ProductEntity product = productRepository.findById(req.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Tính số ngày thuê
            long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate());
            if (days <= 0) days = 1; // Tối thiểu 1 ngày nếu người dùng chọn sai hoặc cùng ngày

            // Tính tổng tiền cho từng sản phẩm: price * quantity * days
            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(req.getQuantity()))
                    .multiply(BigDecimal.valueOf(days));

            totalPrice.updateAndGet(v -> v.add(itemTotal)); // Cập nhật tổng tiền

            return OrderDetailEntity.builder()
                    .order(finalOrder)
                    .product(product)
                    .quantity(req.getQuantity())
                    .size(req.getSize())
                    .price(product.getPrice())
                    .startDate(req.getStartDate())
                    .endDate(req.getEndDate())
                    .build();
        }).collect(Collectors.toList());

        orderDetailRepository.saveAll(orderDetails); // Lưu danh sách chi tiết đơn hàng

        // 3️⃣ Cập nhật tổng tiền đơn hàng
        order.setTotalPrice(totalPrice.get());
        order.setOutstandingAmount(totalPrice.get());
        orderRepository.save(order); // Cập nhật lại đơn hàng với tổng tiền chính xác

        // 4️⃣ Chuyển đổi OrderDetailEntity sang OrderDetailResponse
        List<OrderDetailResponse> detailResponses = orderDetails.stream()
                .map(detail -> new OrderDetailResponse(
                        detail.getProduct().getId(),
                        detail.getProduct().getName(),
                        detail.getSize(),
                        detail.getQuantity(),
                        detail.getPrice(),
                        detail.getProduct().getImageUrl()
                )).toList();

        // 5️⃣ Trả về OrderResponse
        return OrderResponse.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .orderDate(order.getOrderDate())
                .orderDetails(detailResponses)
                .orderStatus(order.getOrderStatus().getDisplayName())
                .build();
    }



    // Kiểm tra và hủy đơn hàng nếu quá 24 giờ mà chưa thanh toán
    @Scheduled(fixedRate = 3600000) // Chạy mỗi giờ
    public void cancelUnpaidOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<OrderEntity> pendingOrders = orderRepository.findByOrderStatus(OrderStatus.PENDING);

        for (OrderEntity order : pendingOrders) {
            if (order.getOrderDate().plusHours(24).isBefore(now)) {
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }
    }


    public Page<OrderResponse> getAllOrdersByUser(int page) {
        int defaultSize = 10; // số bản ghi trên mỗi trang
        Pageable pageable = PageRequest.of(page, defaultSize, Sort.by(Sort.Direction.DESC, "orderDate"));

        // Lấy username từ context
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Phân trang đơn hàng theo user
        Page<OrderEntity> orderPage = orderRepository.findByUser(user, pageable);

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

            return OrderResponse.builder()
                    .orderId(order.getId())
                    .totalPrice(order.getTotalPrice())
                    .orderDate(order.getOrderDate())
                    .orderStatus(order.getOrderStatus().getDisplayName())
                    .startDate(startDate)
                    .endDate(endDate)
                    .orderDetails(orderDetails)
                    .build();
        });
    }



    public OrderResponse updateOrder(Long orderId){
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WalletEntity wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.PARTIALLY_PAID) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            wallet.setBalance(wallet.getBalance().add(order.getTotalPrice().subtract(order.getOutstandingAmount())));
            walletRepository.save(wallet);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);


        List<OrderDetailResponse> orderDetails = orderDetailRepository.findByOrder(order).stream()
                .map(detail -> OrderDetailResponse.builder()
                        .productId(detail.getProduct().getId())
                        .productName(detail.getProduct().getName())
                        .size(detail.getSize())
                        .quantity(detail.getQuantity())
                        .price(detail.getPrice())
                        .imageUrl(detail.getProduct().getImageUrl())
                        .build())
                .collect(Collectors.toList());


        return OrderResponse.builder()
                .orderId(orderId)
                .totalPrice(order.getTotalPrice())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus().getDisplayName())
                .orderDetails(orderDetails)
                .build();

    }

    public OrderResponse getOrderById(Long orderId){
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return OrderResponse.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus().getDisplayName())
                .outstandingAmount(order.getOutstandingAmount())
                .build();

    }


    public Boolean giveBack(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Chỉ có thể trả hàng cho đơn đã thanh toán");
        }

        order.setOrderStatus(OrderStatus.RETURNING); // cập nhật trạng thái
        orderRepository.save(order); // lưu lại

        return true;
    }

}
