package com.laptrinhweb.laptrinhweb.service;

import com.laptrinhweb.laptrinhweb.Enum.OrderStatus;
import com.laptrinhweb.laptrinhweb.Enum.PaymentStatus;
import com.laptrinhweb.laptrinhweb.Enum.PaymentType;
import com.laptrinhweb.laptrinhweb.dto.request.PaymentRequest;
import com.laptrinhweb.laptrinhweb.dto.request.WalletRequest;
import com.laptrinhweb.laptrinhweb.dto.response.PaymentResponse;
import com.laptrinhweb.laptrinhweb.dto.response.WalletResponse;
import com.laptrinhweb.laptrinhweb.entity.*;
import com.laptrinhweb.laptrinhweb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public PaymentResponse payment(PaymentRequest paymentRequest) {
        // Lấy thông tin người dùng từ SecurityContext
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy thông tin ví của người dùng
        WalletEntity wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // Lấy thông tin đơn hàng
        OrderEntity order = orderRepository.findById(paymentRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus().equals(OrderStatus.CANCELLED)) {
            throw new RuntimeException("Order cancelled");
        }

        BigDecimal amountPay;

        if(paymentRequest.getPaymentType() == PaymentType.DEPOSIT){
            amountPay = order.getTotalPrice().multiply(BigDecimal.valueOf(0.2));

            if(order.getOutstandingAmount().compareTo(order.getTotalPrice().multiply(BigDecimal.valueOf(0.8))) < 0){
                throw new RuntimeException("Order out of stock");
            }
        } else if (paymentRequest.getPaymentType() == PaymentType.FULL_PAYMENT) {
            amountPay = order.getOutstandingAmount();

            if(amountPay.compareTo(BigDecimal.ZERO) == 0){
                throw new RuntimeException("Order out of stock");
            }
        }else {
            throw new RuntimeException("Invalid payment type");
        }

        if (wallet.getBalance().compareTo(amountPay) < 0) {
            throw new RuntimeException("Wallet balance is less than wallet balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amountPay));
        walletRepository.save(wallet);

        PaymentEntity paymentEntity = new PaymentEntity();
        paymentEntity.setOrder(order);
        paymentEntity.setAmountPaid(amountPay);
        paymentEntity.setPaymentDate(LocalDateTime.now());
        paymentEntity.setPaymentType(paymentRequest.getPaymentType());
        paymentRepository.save(paymentEntity);

        order.setOutstandingAmount(order.getOutstandingAmount().subtract(amountPay));

        if(order.getOutstandingAmount().compareTo(BigDecimal.ZERO) == 0){
            order.setOrderStatus(OrderStatus.PAID);
        }else {
            order.setOrderStatus(OrderStatus.PARTIALLY_PAID);
        }
        orderRepository.save(order);

        return PaymentResponse.builder()
                .orderId(order.getId())
                .paymentType(paymentRequest.getPaymentType())
                .amountPaid(amountPay)
                .outstandingAmount(order.getOutstandingAmount())
                .build();
    }


    public WalletResponse updateWallet(WalletRequest walletRequest) {
        var contex = SecurityContextHolder.getContext();
        String name = contex.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WalletEntity wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(walletRequest.getAmount()));
        walletRepository.save(wallet);
        return WalletResponse.builder()
                .walletId(wallet.getId())
                .userName(user.getUserName())
                .balance(wallet.getBalance())
                .build();
    }

    public WalletResponse withdrawFromWallet(WalletRequest walletRequest) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        UserEntity user = userRepository.findByUserName(name)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WalletEntity wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // Kiểm tra số dư
        if (wallet.getBalance().compareTo(walletRequest.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Trừ tiền
        wallet.setBalance(wallet.getBalance().subtract(walletRequest.getAmount()));
        walletRepository.save(wallet);

        return WalletResponse.builder()
                .walletId(wallet.getId())
                .userName(user.getUserName())
                .balance(wallet.getBalance())
                .build();
    }


}
