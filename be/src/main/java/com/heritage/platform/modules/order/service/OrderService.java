package com.heritage.platform.modules.order.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.order.dto.*;
import com.heritage.platform.modules.order.entity.EscrowTransaction;
import com.heritage.platform.modules.order.entity.Order;
import com.heritage.platform.modules.order.entity.OrderItem;
import com.heritage.platform.modules.order.repository.OrderRepository;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EscrowService escrowService;

    private static final String DEFAULT_BANK_NAME = "Ngân hàng Quân Đội (MB Bank)";
    private static final String DEFAULT_BANK_ACCOUNT = "0988123456";
    private static final String DEFAULT_BANK_BIN = "970422";

    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("EMPTY_CART", "Giỏ hàng không có sản phẩm nào để thanh toán");
        }

        User customer = null;
        if (customerId != null) {
            customer = userRepository.findById(customerId).orElse(null);
        }
        if (customer == null) {
            // Lấy hoặc tạo user vãng lai mặc định
            customer = userRepository.findByEmail("customer@heritage.vn")
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Không tìm thấy thông tin khách hàng")));
        }

        // Sinh mã đơn hàng theo chuẩn: VN-YYYYMMDD-XXXX
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String orderCode = "VN-" + datePart + "-" + randomSuffix;

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        ArtisanProfile primaryArtisan = null;

        Order order = Order.builder()
                .orderCode(orderCode)
                .customer(customer)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "VIETQR")
                .paymentStatus("PENDING")
                .shippingStatus("PREPARING")
                .shippingAddress(request.getShippingAddress().trim() + 
                        " (Người nhận: " + request.getRecipientName().trim() + 
                        ", SĐT: " + request.getRecipientPhone().trim() + 
                        (request.getCustomerNote() != null && !request.getCustomerNote().isBlank() ? " | Ghi chú: " + request.getCustomerNote().trim() : "") + ")")
                .build();

        for (CreateOrderRequest.CartItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Sản phẩm mã #" + itemReq.getProductId() + " không tồn tại"));

            if (product.isDeleted() || !"PUBLISHED".equalsIgnoreCase(product.getStatus())) {
                throw new BusinessException("PRODUCT_UNAVAILABLE", "Tác phẩm '" + product.getName() + "' hiện không khả dụng để đặt mua");
            }

            int requestedQty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 1;

            if (requestedQty > currentStock) {
                throw new BusinessException("INSUFFICIENT_STOCK", "Tác phẩm '" + product.getName() + "' chỉ còn " + currentStock + " sản phẩm trong kho (Bạn yêu cầu " + requestedQty + ")");
            }

            // Trừ tồn kho an toàn
            product.setStockQuantity(currentStock - requestedQty);
            productRepository.save(product);

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestedQty));
            totalAmount = totalAmount.add(subtotal);

            if (primaryArtisan == null && product.getArtisan() != null) {
                primaryArtisan = product.getArtisan();
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .unitPrice(unitPrice)
                    .quantity(requestedQty)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
        }

        // Tính phí vận chuyển (Miễn phí vận chuyển cho đơn trên 2.000.000đ, mặc định 30.000đ cho đóng gói di sản chống sốc)
        BigDecimal shippingFee = totalAmount.compareTo(new BigDecimal("2000000.00")) >= 0 
                ? BigDecimal.ZERO 
                : new BigDecimal("30000.00");

        BigDecimal finalAmount = totalAmount.add(shippingFee);

        order.setTotalAmount(totalAmount);
        order.setShippingFee(shippingFee);
        order.setFinalAmount(finalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        log.info("[ORDER_CREATED] Mã đơn={}, Tổng tiền={}, Khách={}", orderCode, finalAmount, request.getRecipientName());

        // Khởi tạo Ký quỹ bảo hộ thanh toán Escrow tự động cho Nghệ nhân
        EscrowTransaction escrow = null;
        if (primaryArtisan != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            try {
                escrow = escrowService.createEscrowHold(savedOrder, primaryArtisan, totalAmount);
            } catch (Exception e) {
                log.warn("[ESCROW_INIT_WARNING] Không thể tạo Escrow cho đơn {}: {}", orderCode, e.getMessage());
            }
        }

        return mapToResponse(savedOrder, escrow);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long customerId) {
        List<Order> orders;
        if (customerId != null) {
            orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        } else {
            orders = orderRepository.findAll();
        }

        return orders.stream()
                .map(o -> {
                    EscrowTransaction escrow = escrowService.getEscrowByOrderId(o.getId());
                    return mapToResponse(o, escrow);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long currentUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng với ID: " + orderId));

        EscrowTransaction escrow = escrowService.getEscrowByOrderId(order.getId());
        return mapToResponse(order, escrow);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long customerId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng với ID: " + orderId));

        if (!"PREPARING".equalsIgnoreCase(order.getShippingStatus())) {
            throw new BusinessException("CANNOT_CANCEL_ORDER", 
                    "Không thể hủy đơn hàng do nghệ nhân đã bắt đầu chế tác hoặc đơn đã xuất kho (Trạng thái: " + order.getShippingStatus() + ")");
        }

        if ("CANCELLED".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new BusinessException("ALREADY_CANCELLED", "Đơn hàng này đã bị hủy trước đó");
        }

        // Hoàn lại số lượng tồn kho cho các sản phẩm
        for (OrderItem item : order.getItems()) {
            Product p = item.getProduct();
            if (p != null) {
                p.setStockQuantity((p.getStockQuantity() != null ? p.getStockQuantity() : 0) + item.getQuantity());
                productRepository.save(p);
            }
        }

        order.setPaymentStatus("CANCELLED");
        order.setShippingStatus("CANCELLED");
        orderRepository.save(order);

        // Hủy ký quỹ nếu có
        EscrowTransaction escrow = escrowService.getEscrowByOrderId(order.getId());
        if (escrow != null && "HOLDING".equalsIgnoreCase(escrow.getStatus())) {
            escrowService.refundEscrowToCustomer(order.getId(), reason != null ? reason : "Khách hàng hủy đơn");
            escrow = escrowService.getEscrowByOrderId(order.getId());
        }

        log.info("[ORDER_CANCELLED] Đã hủy đơn hàng: id={}, lý do={}", orderId, reason);
        return mapToResponse(order, escrow);
    }

    @Transactional
    public OrderResponse updateShippingStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng với ID: " + orderId));

        order.setShippingStatus(newStatus.toUpperCase());
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("PAID");
        }
        orderRepository.save(order);

        EscrowTransaction escrow = escrowService.getEscrowByOrderId(order.getId());
        log.info("[ORDER_STATUS_UPDATED] OrderId={}, Status={}", orderId, newStatus);
        return mapToResponse(order, escrow);
    }

    private OrderResponse mapToResponse(Order order, EscrowTransaction escrow) {
        String txContent = order.getOrderCode();
        String qrImageUrl = "https://img.vietqr.io/image/" + DEFAULT_BANK_BIN + "-" + DEFAULT_BANK_ACCOUNT + "-compact2.png" +
                "?amount=" + order.getFinalAmount().longValue() + 
                "&addInfo=" + txContent + 
                "&accountName=CONG%20TY%20DI%20SAN%20VIET%20NAM";

        List<OrderItemDto> itemDtos = order.getItems().stream().map(i -> {
            Product p = i.getProduct();
            return OrderItemDto.builder()
                    .id(i.getId())
                    .productId(p != null ? p.getId() : null)
                    .productName(p != null ? p.getName() : "Tác phẩm thủ công")
                    .productImageUrl(p != null ? p.getImageUrl() : null)
                    .skuCode(p != null ? p.getSkuCode() : null)
                    .passportCode(p != null ? p.getSkuCode() : null)
                    .artisanId(p != null && p.getArtisan() != null ? p.getArtisan().getId() : null)
                    .artisanName(p != null && p.getArtisan() != null && p.getArtisan().getUser() != null 
                            ? p.getArtisan().getUser().getFullName() : "Nghệ nhân làng nghề")
                    .unitPrice(i.getUnitPrice())
                    .quantity(i.getQuantity())
                    .subtotal(i.getSubtotal())
                    .build();
        }).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách hàng di sản")
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .finalAmount(order.getFinalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingStatus(order.getShippingStatus())
                .shippingAddress(order.getShippingAddress())
                .vietQrPayload(txContent)
                .vietQrImageUrl(qrImageUrl)
                .bankAccountNumber(DEFAULT_BANK_ACCOUNT)
                .bankName(DEFAULT_BANK_NAME)
                .transferContent(txContent)
                .escrowStatus(escrow != null ? escrow.getStatus() : "NOT_APPLICABLE")
                .escrowHoldAmount(escrow != null ? escrow.getHoldAmount() : null)
                .escrowNetPayout(escrow != null ? escrow.getNetPayout() : null)
                .escrowAutoReleaseDate(escrow != null ? escrow.getAutoReleaseDate() : null)
                .isDisputed(escrow != null && "DISPUTED".equalsIgnoreCase(escrow.getStatus()))
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
