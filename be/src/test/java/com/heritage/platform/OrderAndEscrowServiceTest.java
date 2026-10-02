package com.heritage.platform;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.order.dto.CancelOrderRequest;
import com.heritage.platform.modules.order.dto.CreateOrderRequest;
import com.heritage.platform.modules.order.dto.OrderResponse;
import com.heritage.platform.modules.order.entity.EscrowTransaction;
import com.heritage.platform.modules.order.entity.Order;
import com.heritage.platform.modules.order.repository.OrderRepository;
import com.heritage.platform.modules.order.service.EscrowService;
import com.heritage.platform.modules.order.service.OrderService;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderAndEscrowServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private EscrowService escrowService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtisanProfileRepository artisanProfileRepository;

    private User testCustomer;
    private Product testProduct;
    private ArtisanProfile testArtisan;

    @BeforeEach
    void setUp() {
        testCustomer = userRepository.findByEmail("customer@heritage.vn").orElseGet(() -> {
            User c = User.builder()
                    .email("customer_test@heritage.vn")
                    .phone("0999888777")
                    .fullName("Customer Tester")
                    .passwordHash("hashed")
                    .role("ROLE_CUSTOMER")
                    .build();
            return userRepository.save(c);
        });

        testArtisan = artisanProfileRepository.findAll().stream().findFirst().orElseThrow();
        testProduct = productRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Test
    @DisplayName("Đặt hàng thành công, tự động tính tổng tiền, tạo VietQR và kích hoạt ký quỹ Escrow HOLDING")
    void testCreateOrder_Success() {
        int initialStock = testProduct.getStockQuantity();

        CreateOrderRequest req = CreateOrderRequest.builder()
                .recipientName("Nguyen Van A")
                .recipientPhone("0987654321")
                .shippingAddress("123 Pho Hue, Ha Noi")
                .paymentMethod("VIETQR")
                .items(List.of(
                        CreateOrderRequest.CartItemRequest.builder()
                                .productId(testProduct.getId())
                                .quantity(1)
                                .build()
                ))
                .build();

        OrderResponse res = orderService.createOrder(testCustomer.getId(), req);

        assertNotNull(res);
        assertNotNull(res.getOrderCode());
        assertTrue(res.getOrderCode().startsWith("VN-"));
        assertEquals("PENDING", res.getPaymentStatus());
        assertEquals("PREPARING", res.getShippingStatus());
        assertEquals("HOLDING", res.getEscrowStatus());
        assertNotNull(res.getVietQrImageUrl());

        // Kiểm tra trừ tồn kho
        Product updatedProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialStock - 1, updatedProduct.getStockQuantity());
    }

    @Test
    @DisplayName("Đặt hàng thất bại khi số lượng yêu cầu vượt quá tồn kho")
    void testCreateOrder_InsufficientStock_ThrowsException() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .recipientName("Nguyen Van B")
                .recipientPhone("0987654322")
                .shippingAddress("456 Cau Giay, Ha Noi")
                .items(List.of(
                        CreateOrderRequest.CartItemRequest.builder()
                                .productId(testProduct.getId())
                                .quantity(9999) // Vượt quá tồn kho
                                .build()
                ))
                .build();

        assertThrows(BusinessException.class, () -> orderService.createOrder(testCustomer.getId(), req));
    }

    @Test
    @DisplayName("Hủy đơn hàng thành công khi còn ở trạng thái PREPARING và hoàn lại tồn kho")
    void testCancelOrder_Success() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .recipientName("Nguyen Van C")
                .recipientPhone("0987654323")
                .shippingAddress("789 Kim Ma, Ha Noi")
                .items(List.of(
                        CreateOrderRequest.CartItemRequest.builder()
                                .productId(testProduct.getId())
                                .quantity(1)
                                .build()
                ))
                .build();

        OrderResponse created = orderService.createOrder(testCustomer.getId(), req);
        int stockAfterCreate = productRepository.findById(testProduct.getId()).orElseThrow().getStockQuantity();

        OrderResponse cancelled = orderService.cancelOrder(created.getId(), testCustomer.getId(), "Doi y khong mua nua");
        assertEquals("CANCELLED", cancelled.getPaymentStatus());
        assertEquals("CANCELLED", cancelled.getShippingStatus());

        int stockAfterCancel = productRepository.findById(testProduct.getId()).orElseThrow().getStockQuantity();
        assertEquals(stockAfterCreate + 1, stockAfterCancel);
    }

    @Test
    @DisplayName("Mở khiếu nại ký quỹ Escrow chuyển trạng thái sang DISPUTED")
    void testDisputeEscrow_Success() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .recipientName("Nguyen Van D")
                .recipientPhone("0987654324")
                .shippingAddress("12 Tran Phu, Ha Noi")
                .items(List.of(
                        CreateOrderRequest.CartItemRequest.builder()
                                .productId(testProduct.getId())
                                .quantity(1)
                                .build()
                ))
                .build();

        OrderResponse created = orderService.createOrder(testCustomer.getId(), req);
        escrowService.disputeEscrow(created.getId(), "Men gom bi nut vo khi van chuyen", "https://img.domain/evidence.jpg");

        EscrowTransaction escrow = escrowService.getEscrowByOrderId(created.getId());
        assertNotNull(escrow);
        assertEquals("DISPUTED", escrow.getStatus());
        assertEquals("Men gom bi nut vo khi van chuyen", escrow.getDisputeReason());
    }

    @Test
    @DisplayName("Giải ngân ký quỹ thành công chuyển tiền từ escrow_balance sang available_balance của nghệ nhân")
    void testReleaseEscrowToArtisan_Success() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .recipientName("Nguyen Van E")
                .recipientPhone("0987654325")
                .shippingAddress("99 Hoang Hoa Tham, Ha Noi")
                .items(List.of(
                        CreateOrderRequest.CartItemRequest.builder()
                                .productId(testProduct.getId())
                                .quantity(1)
                                .build()
                ))
                .build();

        OrderResponse created = orderService.createOrder(testCustomer.getId(), req);
        EscrowTransaction escrowBefore = escrowService.getEscrowByOrderId(created.getId());
        BigDecimal netPayout = escrowBefore.getNetPayout();
        ArtisanProfile artisan = escrowBefore.getArtisan();
        BigDecimal initialAvailable = artisan != null && artisan.getAvailableBalance() != null 
                ? artisan.getAvailableBalance() 
                : BigDecimal.ZERO;

        escrowService.releaseEscrowToArtisan(created.getId());

        EscrowTransaction escrowAfter = escrowService.getEscrowByOrderId(created.getId());
        assertEquals("RELEASED", escrowAfter.getStatus());
        assertNotNull(escrowAfter.getReleasedAt());
        assertNotNull(escrowAfter.getArtisan());
        assertEquals(initialAvailable.add(netPayout), escrowAfter.getArtisan().getAvailableBalance());
    }
}
