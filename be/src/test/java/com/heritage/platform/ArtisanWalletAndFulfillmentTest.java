package com.heritage.platform;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.dto.ArtisanOrderDto;
import com.heritage.platform.modules.artisan.dto.UpdateOrderStatusRequest;
import com.heritage.platform.modules.artisan.dto.WalletResponse;
import com.heritage.platform.modules.artisan.dto.WithdrawRequest;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.entity.WalletTransaction;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.artisan.service.ArtisanOrderService;
import com.heritage.platform.modules.artisan.service.ArtisanPayoutService;
import com.heritage.platform.modules.order.entity.Order;
import com.heritage.platform.modules.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ArtisanWalletAndFulfillmentTest {

    @Autowired
    private ArtisanPayoutService payoutService;

    @Autowired
    private ArtisanOrderService artisanOrderService;

    @Autowired
    private ArtisanProfileRepository artisanProfileRepository;

    @Autowired
    private OrderRepository orderRepository;

    private ArtisanProfile testArtisan;

    @BeforeEach
    void setUp() {
        testArtisan = artisanProfileRepository.findAll().stream().findFirst().orElseThrow();
        testArtisan.setAvailableBalance(new BigDecimal("10000000.00"));
        testArtisan.setEscrowBalance(new BigDecimal("5000000.00"));
        testArtisan = artisanProfileRepository.save(testArtisan);
    }

    @Test
    @DisplayName("Nghệ nhân rút tiền thành công: Trừ số dư khả dụng và ghi log giao dịch")
    void testWithdraw_Success() {
        BigDecimal initialAvailable = testArtisan.getAvailableBalance();
        BigDecimal withdrawAmount = new BigDecimal("500000.00");

        WithdrawRequest req = WithdrawRequest.builder()
                .amount(withdrawAmount)
                .bankName("Vietcombank")
                .bankAccountNumber("0011009988776")
                .bankAccountName("BUI GIA GOM")
                .note("Rut tien test")
                .build();

        WalletTransaction tx = payoutService.requestWithdraw(testArtisan.getId(), req);

        assertNotNull(tx);
        assertEquals("COMPLETED", tx.getStatus());
        assertEquals("WITHDRAW", tx.getTransactionType());
        assertEquals(withdrawAmount, tx.getAmount());
        assertNotNull(tx.getTxReference());

        ArtisanProfile updated = artisanProfileRepository.findById(testArtisan.getId()).orElseThrow();
        assertEquals(initialAvailable.subtract(withdrawAmount), updated.getAvailableBalance());
    }

    @Test
    @DisplayName("Rút tiền thất bại khi số tiền yêu cầu vượt quá số dư khả dụng")
    void testWithdraw_InsufficientBalance_ThrowsException() {
        BigDecimal excessiveAmount = testArtisan.getAvailableBalance().add(new BigDecimal("999999999.00"));

        WithdrawRequest req = WithdrawRequest.builder()
                .amount(excessiveAmount)
                .bankName("Vietcombank")
                .bankAccountNumber("0011009988776")
                .bankAccountName("BUI GIA GOM")
                .build();

        assertThrows(BusinessException.class, () -> payoutService.requestWithdraw(testArtisan.getId(), req));
    }

    @Test
    @DisplayName("Cập nhật trạng thái đơn hàng trên bảng Kanban Nghệ nhân (CRAFTING -> SHIPPED)")
    void testUpdateOrderStatus_Success() {
        Order sampleOrder = orderRepository.findAll().stream()
                .filter(o -> "CRAFTING".equals(o.getShippingStatus()))
                .findFirst()
                .orElseGet(() -> orderRepository.findAll().get(0));

        UpdateOrderStatusRequest req = UpdateOrderStatusRequest.builder()
                .status("SHIPPED")
                .trackingNumber("VNPOST-TEST-12345")
                .note("Da dong goi xong hop di san")
                .build();

        ArtisanOrderDto updated = artisanOrderService.updateOrderStatus(testArtisan.getId(), sampleOrder.getId(), req);
        assertNotNull(updated);
        assertEquals("SHIPPED", updated.getShippingStatus());
    }

    @Test
    @DisplayName("Sinh phiếu in tem giao hàng và mã vận đơn VNPost cho đơn hàng")
    void testGenerateShippingLabel_Success() {
        Order sampleOrder = orderRepository.findAll().get(0);

        Map<String, Object> labelData = artisanOrderService.generateShippingLabel(testArtisan.getId(), sampleOrder.getId());
        assertNotNull(labelData);
        assertNotNull(labelData.get("trackingNumber"));
        assertTrue(labelData.get("trackingNumber").toString().startsWith("VNPOST-BTG-"));
        assertNotNull(labelData.get("barcodeUrl"));
    }
}
