package com.heritage.platform.modules.artisan.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.artisan.dto.ArtisanOrderDto;
import com.heritage.platform.modules.artisan.dto.UpdateOrderStatusRequest;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.order.dto.OrderItemDto;
import com.heritage.platform.modules.order.entity.EscrowTransaction;
import com.heritage.platform.modules.order.entity.Order;
import com.heritage.platform.modules.order.entity.OrderItem;
import com.heritage.platform.modules.order.repository.OrderRepository;
import com.heritage.platform.modules.order.service.EscrowService;
import com.heritage.platform.modules.product.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtisanOrderService {

    private final OrderRepository orderRepository;
    private final ArtisanProfileRepository artisanRepository;
    private final EscrowService escrowService;

    @Transactional(readOnly = true)
    public List<ArtisanOrderDto> getArtisanOrders(Long artisanId) {
        ArtisanProfile artisan = getArtisanOrFallback(artisanId);
        Long targetArtisanId = artisan.getId();

        List<Order> allOrders = orderRepository.findAll();

        return allOrders.stream()
                .filter(o -> o.getItems().stream().anyMatch(i -> 
                        i.getProduct() != null && i.getProduct().getArtisan() != null &&
                        i.getProduct().getArtisan().getId().equals(targetArtisanId)
                ))
                .map(o -> mapToArtisanOrderDto(o, targetArtisanId))
                .sorted(Comparator.comparing(ArtisanOrderDto::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public ArtisanOrderDto updateOrderStatus(Long artisanId, Long orderId, UpdateOrderStatusRequest req) {
        ArtisanProfile artisan = getArtisanOrFallback(artisanId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng với ID: " + orderId));

        String newStatus = req.getStatus().toUpperCase();
        order.setShippingStatus(newStatus);

        if ("DELIVERED".equals(newStatus)) {
            order.setPaymentStatus("PAID");
        }

        orderRepository.save(order);
        log.info("[ARTISAN_ORDER_UPDATE] Nghệ nhân #{} cập nhật đơn #{}: Trạng thái={}", artisan.getId(), orderId, newStatus);

        return mapToArtisanOrderDto(order, artisan.getId());
    }

    @Transactional
    public Map<String, Object> generateShippingLabel(Long artisanId, Long orderId) {
        ArtisanProfile artisan = getArtisanOrFallback(artisanId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng với ID: " + orderId));

        String trackingNumber = "VNPOST-BTG-" + order.getOrderCode().replace("VN-", "") + "-" + (System.currentTimeMillis() % 1000);
        String labelBarcode = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + trackingNumber + "&scale=2&height=12";

        Map<String, Object> labelData = new HashMap<>();
        labelData.put("orderCode", order.getOrderCode());
        labelData.put("trackingNumber", trackingNumber);
        labelData.put("senderName", artisan.getUser() != null ? artisan.getUser().getFullName() : artisan.getTitle());
        labelData.put("senderAddress", artisan.getWorkshopAddress());
        labelData.put("recipientInfo", order.getShippingAddress());
        labelData.put("finalAmount", order.getFinalAmount());
        labelData.put("barcodeUrl", labelBarcode);
        labelData.put("carrier", "VNPost - Bưu Điện Việt Nam (Vận Chuyển Hàng Thủ Công Cao Cấp)");

        log.info("[SHIPPING_LABEL_GENERATED] Sinh mã vận đơn cho đơn {}: Mã={}", order.getOrderCode(), trackingNumber);
        return labelData;
    }

    private ArtisanProfile getArtisanOrFallback(Long artisanId) {
        if (artisanId != null) {
            return artisanRepository.findById(artisanId)
                    .orElseGet(() -> artisanRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân")));
        }
        return artisanRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("ARTISAN_NOT_FOUND", "Không tìm thấy hồ sơ nghệ nhân"));
    }

    private ArtisanOrderDto mapToArtisanOrderDto(Order order, Long artisanId) {
        List<OrderItemDto> items = order.getItems().stream()
                .filter(i -> i.getProduct() != null && i.getProduct().getArtisan() != null &&
                        i.getProduct().getArtisan().getId().equals(artisanId))
                .map(i -> {
                    Product p = i.getProduct();
                    return OrderItemDto.builder()
                            .id(i.getId())
                            .productId(p != null ? p.getId() : null)
                            .productName(p != null ? p.getName() : "Tác phẩm thủ công")
                            .productImageUrl(p != null ? p.getImageUrl() : null)
                            .skuCode(p != null ? p.getSkuCode() : null)
                            .passportCode(p != null ? p.getSkuCode() : null)
                            .unitPrice(i.getUnitPrice())
                            .quantity(i.getQuantity())
                            .subtotal(i.getSubtotal())
                            .build();
                }).collect(Collectors.toList());

        BigDecimal artisanSubtotal = items.stream()
                .map(OrderItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        EscrowTransaction escrow = escrowService.getEscrowByOrderId(order.getId());
        BigDecimal netPayout = escrow != null ? escrow.getNetPayout() : artisanSubtotal.multiply(new BigDecimal("0.95"));

        return ArtisanOrderDto.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách hàng di sản")
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .shippingAddress(order.getShippingAddress())
                .totalAmount(artisanSubtotal)
                .artisanPayout(netPayout)
                .shippingStatus(order.getShippingStatus())
                .paymentStatus(order.getPaymentStatus())
                .escrowStatus(escrow != null ? escrow.getStatus() : "NOT_APPLICABLE")
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
