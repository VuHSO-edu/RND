package com.heritage.platform.common.config;

import com.heritage.platform.common.util.HashUtils;
import com.heritage.platform.modules.artisan.entity.ArtisanProfile;
import com.heritage.platform.modules.artisan.repository.ArtisanProfileRepository;
import com.heritage.platform.modules.passport.entity.HeritagePassport;
import com.heritage.platform.modules.passport.entity.PassportAuditLog;
import com.heritage.platform.modules.passport.repository.HeritagePassportRepository;
import com.heritage.platform.modules.passport.repository.PassportAuditLogRepository;
import com.heritage.platform.modules.product.entity.Product;
import com.heritage.platform.modules.product.repository.ProductRepository;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import com.heritage.platform.modules.gis.entity.OrgUnit;
import com.heritage.platform.modules.gis.entity.PowerAsset;
import com.heritage.platform.modules.gis.repository.OrgUnitRepository;
import com.heritage.platform.modules.gis.repository.PowerAssetRepository;
import com.heritage.platform.modules.article.entity.HeritageArticle;
import com.heritage.platform.modules.article.repository.HeritageArticleRepository;
import com.heritage.platform.modules.tour.entity.HeritageTour;
import com.heritage.platform.modules.tour.repository.HeritageTourRepository;
import com.heritage.platform.modules.crowdfunding.entity.CrowdfundingCampaign;
import com.heritage.platform.modules.crowdfunding.repository.CrowdfundingCampaignRepository;
import com.heritage.platform.modules.map.entity.MapLocation;
import com.heritage.platform.modules.map.repository.MapLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CraftVillageRepository craftVillageRepository;
    private final ArtisanProfileRepository artisanProfileRepository;
    private final ProductRepository productRepository;
    private final HeritagePassportRepository passportRepository;
    private final PassportAuditLogRepository auditLogRepository;
    private final OrgUnitRepository orgUnitRepository;
    private final PowerAssetRepository powerAssetRepository;
    private final HeritageArticleRepository articleRepository;
    private final HeritageTourRepository tourRepository;
    private final CrowdfundingCampaignRepository campaignRepository;
    private final MapLocationRepository mapLocationRepository;
    private final com.heritage.platform.modules.order.repository.OrderRepository orderRepository;
    private final com.heritage.platform.modules.order.service.EscrowService escrowService;
    private final com.heritage.platform.modules.artisan.repository.WalletTransactionRepository walletTransactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("[DATA_INIT] Kiểm tra và đồng bộ cơ sở dữ liệu hệ thống...");

        try {
            jdbcTemplate.execute("UPDATE heritage_passports SET is_revoked = false WHERE is_revoked IS NULL");
            jdbcTemplate.execute("UPDATE heritage_passports SET is_claimed = false WHERE is_claimed IS NULL");
            jdbcTemplate.execute("UPDATE heritage_passports SET is_counterfeit_alert = false WHERE is_counterfeit_alert IS NULL");
        } catch (Exception e) {
            log.debug("Sanitize heritage_passports nulls ignored: {}", e.getMessage());
        }

        // 0. Tạo người dùng Gis Admin (admin_gis) chuẩn
        if (userRepository.findByUsername("admin_gis").isEmpty()) {
            User adminGis = User.builder()
                    .username("admin_gis")
                    .fullName("Gis Admin")
                    .email("admin_gis@npc.com.vn")
                    .phone("0988001122")
                    .unitCode("F01")
                    .unitName("Tổng Công ty điện lực miền Bắc")
                    .passwordHash(passwordEncoder.encode("GisAdmin@2026"))
                    .role("ROLE_ADMIN")
                    .status("ACTIVE")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                    .build();
            userRepository.save(adminGis);
            log.info("[DATA_INIT] Đã tạo tài khoản quản trị: admin_gis (Gis Admin)");
        }

        // 0.1 Tạo cây đơn vị EVN NPC
        if (orgUnitRepository.count() == 0) {
            OrgUnit f01 = OrgUnit.builder().code("F01").name("Tổng Công ty điện lực miền Bắc").level(1).type("TONG_CONG_TY").latitude(21.0285).longitude(105.8542).address("Hà Nội").build();
            OrgUnit f01A02 = OrgUnit.builder().code("F01A02").name("Ban QLDA lưới điện").parentCode("F01").level(2).type("BAN").latitude(21.0315).longitude(105.8500).build();
            OrgUnit f01F12F15 = OrgUnit.builder().code("F01F12F15").name("Đội Quản lý điện lực khu vực Mường Khương").parentCode("F01A02").level(3).type("DOI").latitude(22.5034).longitude(104.1432).build();
            OrgUnit f01B01 = OrgUnit.builder().code("F01B01").name("Công ty TNHH MTV Thủy điện Sa Pa").parentCode("F01A02").level(3).type("CONG_TY").latitude(22.3364).longitude(103.8438).build();
            OrgUnit f01D02 = OrgUnit.builder().code("F01D02").name("Công ty TNHH MTV Thí nghiệm điện miền Bắc").parentCode("F01A02").level(3).type("CONG_TY").latitude(21.0350).longitude(105.8420).build();
            OrgUnit f01D03 = OrgUnit.builder().code("F01D03").name("Công ty Tư vấn điện miền Bắc - Chi nhánh").parentCode("F01A02").level(3).type("CONG_TY").latitude(21.0250).longitude(105.8490).build();
            OrgUnit f01D04 = OrgUnit.builder().code("F01D04").name("Công ty Công nghệ thông tin Điện lực miền Bắc").parentCode("F01").level(2).type("CONG_TY").latitude(21.0180).longitude(105.8350).build();
            OrgUnit f01D04003 = OrgUnit.builder().code("F01D04003").name("Chi nhánh Hà Nội").parentCode("F01D04").level(3).type("CHI_NHANH").latitude(21.0200).longitude(105.8360).build();
            OrgUnit f01D05 = OrgUnit.builder().code("F01D05").name("Trung tâm chăm sóc khách hàng").parentCode("F01").level(2).type("TRUNG_TAM").latitude(21.0300).longitude(105.8600).build();
            OrgUnit f01E01 = OrgUnit.builder().code("F01E01").name("Trường Cao đẳng Điện lực miền Bắc").parentCode("F01").level(2).type("TRUONG").latitude(20.8449).longitude(106.6881).build();
            OrgUnit f01F03 = OrgUnit.builder().code("F01F03").name("Công ty Điện lực Bắc ninh").parentCode("F01").level(2).type("CONG_TY").latitude(21.1861).longitude(106.0763).build();

            orgUnitRepository.saveAll(List.of(f01, f01A02, f01F12F15, f01B01, f01D02, f01D03, f01D04, f01D04003, f01D05, f01E01, f01F03));
            log.info("[DATA_INIT] Đã khởi tạo hoàn tất Cây đơn vị EVN NPC!");
        }

        // 0.2 Tạo danh sách Thiết bị / Tài sản mẫu
        if (powerAssetRepository.count() == 0) {
            PowerAsset a1 = PowerAsset.builder().code("TEST2").name("TE").assetType("UNIT").unitCode("F01").unitName("Tổng Công ty điện lực miền Bắc").latitude(21.0285).longitude(105.8542).status("ACTIVE").build();
            PowerAsset a2 = PowerAsset.builder().code("F01A02-HQ").name("Trụ sở Ban QLDA").assetType("UNIT").unitCode("F01A02").unitName("Ban QLDA lưới điện").latitude(21.0315).longitude(105.8500).status("ACTIVE").build();
            PowerAsset a3 = PowerAsset.builder().code("DZ-110-BN").name("Đường dây 110kV Bắc Ninh - Quế Võ").assetType("LINE").unitCode("F01F03").unitName("Công ty Điện lực Bắc ninh").voltageLevel("110kV").latitude(21.1861).longitude(106.0763).status("ACTIVE").build();
            PowerAsset a4 = PowerAsset.builder().code("DZ-220-HN").name("Đường dây 220kV Sóc Sơn - Chèm").assetType("LINE").unitCode("F01").unitName("Tổng Công ty điện lực miền Bắc").voltageLevel("220kV").latitude(21.2500).longitude(105.8300).status("ACTIVE").build();
            PowerAsset a5 = PowerAsset.builder().code("TBA-110-HN").name("Trạm biến áp 110kV Bát Tràng - Gia Lâm").assetType("DEVICE").unitCode("F01").unitName("Tổng Công ty điện lực miền Bắc").voltageLevel("110kV").latitude(20.9781).longitude(105.9125).status("ACTIVE").build();
            PowerAsset a6 = PowerAsset.builder().code("TBA-220-SP").name("Trạm biến áp 220kV Sa Pa").assetType("DEVICE").unitCode("F01B01").unitName("Thủy điện Sa Pa").voltageLevel("220kV").latitude(22.3364).longitude(103.8438).status("ACTIVE").build();

            powerAssetRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6));
            log.info("[DATA_INIT] Đã khởi tạo hoàn tất danh sách Tài sản & Thiết bị!");
        }

        // 1. Danh sách 6 Làng nghề tiêu biểu trải dài Bắc - Trung - Nam
        CraftVillage batTrang = CraftVillage.builder()
                .name("Làng Gốm Bát Tràng")
                .slug("lang-gom-bat-trang")
                .region("Bac_Bo")
                .province("Hà Nội")
                .historicalSummary("Làng gốm Bát Tràng hình thành từ thời nhà Lý (hơn 700 năm), nổi danh với dòng men lam, men rạn tam thái độc đáo được lưu giữ qua nhiều thế hệ.")
                .foundingYearEstimate(1352)
                .ancestorWorshipInfo("Thờ thần Hứa Vĩnh Kiều và các bậc tiền hiền khai sáng nghề gốm.")
                .latitude(20.9781)
                .longitude(105.9125)
                .coverImageUrl("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80")
                .build();

        CraftVillage vanPhuc = CraftVillage.builder()
                .name("Làng Lụa Vạn Phúc")
                .slug("lang-lua-van-phuc")
                .region("Bac_Bo")
                .province("Hà Nội")
                .historicalSummary("Làng nghề dệt lụa tơ tằm truyền thống hơn 1.000 năm tuổi, nổi tiếng với lụa vân mỏng nhẹ, hoa văn cung đình thanh nhã.")
                .foundingYearEstimate(1020)
                .latitude(20.9792)
                .longitude(105.7728)
                .coverImageUrl("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80")
                .build();

        CraftVillage nguXa = CraftVillage.builder()
                .name("Làng Đúc Đồng Ngũ Xã")
                .slug("lang-duc-dong-ngu-xa")
                .region("Bac_Bo")
                .province("Hà Nội")
                .historicalSummary("Nổi danh từ thế kỷ XVII với nghệ thuật đúc đồng liền khối tinh xảo, tiêu biểu là pho tượng Phật A Di Đà bằng đồng nguyên khối tại chùa Thần Quang.")
                .foundingYearEstimate(1620)
                .latitude(21.0445)
                .longitude(105.8398)
                .coverImageUrl("https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80")
                .build();

        CraftVillage dongHo = CraftVillage.builder()
                .name("Làng Tranh Dân Gian Đông Hồ")
                .slug("lang-tranh-dong-ho")
                .region("Bac_Bo")
                .province("Bắc Ninh")
                .historicalSummary("Di sản văn hóa phi vật thể quốc gia, in mộc bản trên giấy điệp tự nhiên quét bằng vỏ sò sò điệp óng ánh, gam màu chế từ tro rơm, hoa hòe, sỏi son.")
                .foundingYearEstimate(1550)
                .latitude(21.0967)
                .longitude(106.0961)
                .coverImageUrl("https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=1200&q=80")
                .build();

        CraftVillage nonNuoc = CraftVillage.builder()
                .name("Làng Đá Mỹ Nghệ Non Nước")
                .slug("lang-da-non-nuoc")
                .region("Trung_Bo")
                .province("Đà Nẵng")
                .historicalSummary("Nằm dưới chân ngọn Ngũ Hành Sơn huyền thoại hơn 400 năm, các nghệ nhân biến đá cẩm thạch nguyên khối thành tượng Phật và phù điêu sống động.")
                .foundingYearEstimate(1680)
                .latitude(16.0042)
                .longitude(108.2618)
                .coverImageUrl("https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80")
                .build();

        CraftVillage bauTruc = CraftVillage.builder()
                .name("Làng Gốm Chăm Bàu Trúc")
                .slug("lang-gom-bau-truc")
                .region("Nam_Bo")
                .province("Ninh Thuận")
                .historicalSummary("Một trong những làng gốm cổ xưa nhất Đông Nam Á được UNESCO ghi danh, nung lộ thiên bằng củi và rơm rạ, phụ nữ Chăm chuốt gốm đi giật lùi bằng đôi tay không bàn xoay.")
                .foundingYearEstimate(1150)
                .latitude(11.5173)
                .longitude(108.9567)
                .coverImageUrl("https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80")
                .build();

        List<CraftVillage> defaultVillages = List.of(batTrang, vanPhuc, nguXa, dongHo, nonNuoc, bauTruc);
        for (CraftVillage cv : defaultVillages) {
            if (craftVillageRepository.findBySlugAndIsDeletedFalse(cv.getSlug()).isEmpty()) {
                craftVillageRepository.save(cv);
                log.info("[DATA_INIT] Đã thêm làng nghề: {}", cv.getName());
            }
        }

        CraftVillage batTrangPersisted = craftVillageRepository.findBySlugAndIsDeletedFalse("lang-gom-bat-trang").orElse(batTrang);

        if (productRepository.count() == 0) {
            // 2. Tạo Tài khoản & Nghệ nhân
            User artisanUser = User.builder()
                    .email("artisan.bui@heritage.vn")
                    .phone("0988123456")
                    .fullName("Bùi Gia Gốm")
                    .passwordHash(passwordEncoder.encode("Heritage@2026"))
                    .role("ROLE_ARTISAN")
                    .status("ACTIVE")
                    .build();
            userRepository.save(artisanUser);

            ArtisanProfile artisanProfile = ArtisanProfile.builder()
                    .user(artisanUser)
                    .craftVillage(batTrangPersisted)
                    .title("Nghệ nhân Ưu tú Bát Tràng")
                    .bio("Sinh ra trong cái nôi gốm Bát Tràng, hơn 45 năm miệt mài bên bàn xoay và lò củi, nghệ nhân Bùi Gia Gốm đã phục chế thành công dòng men rạn cổ truyền thời Lê - Mạc, kết hợp hài hòa nét bút dân gian với kỹ nghệ nung lửa bí truyền.")
                    .experienceYears(45)
                    .workshopAddress("Số 18 Thôn 1 Làng Cổ Bát Tràng, Gia Lâm, Hà Nội")
                    .verificationStatus("VERIFIED")
                    .availableBalance(new BigDecimal("34200000.00"))
                    .escrowBalance(new BigDecimal("9600000.00"))
                    .build();
            artisanProfileRepository.save(artisanProfile);

            // 3. Tạo Tác phẩm Di sản
            Product product = Product.builder()
                    .artisan(artisanProfile)
                    .name("Lục Bình Men Rạn Bát Tràng - Cá Chép Vượt Vũ Môn")
                    .slug("luc-binh-men-ran-bat-trang-ca-chep")
                    .categoryId(1) // Gốm sứ
                    .description("Tác phẩm chế tác thủ công hoàn toàn trên bàn xoay truyền thống, họa tiết cá chép vẽ tay men chàm cổ và nung liên tục 36 giờ trong lò củi ở nhiệt độ 1280°C.")
                    .materialInfo("Đất sét non Cao Lanh Bát Tràng chọn lọc, men tro trấu tự nhiên.")
                    .dimensions("Cao 68cm x Đường kính thân 28cm")
                    .weightGram(8500)
                    .price(new BigDecimal("4800000.00"))
                    .stockQuantity(1)
                    .isUniqueArtwork(true)
                    .imageUrl("/images/luc-binh-men-ran-bat-trang.jpg")
                    .status("PUBLISHED")
                    .build();
            productRepository.save(product);

            // 4. Tạo Hộ chiếu Di sản Số
            String rawData = artisanProfile.getId() + ":" + product.getId() + ":" + Instant.now().toEpochMilli();
            HeritagePassport passport = HeritagePassport.builder()
                    .product(product)
                    .passportCode("VN-BT882194")
                    .craftingVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
                    .artisanStoryQuote("Mỗi nếp rạn trên thân bình là một vết nứt thời gian, được nuôi dưỡng bởi hồn đất và tâm huyết của người thợ.")
                    .verificationHash(HashUtils.sha256(rawData))
                    .blockchainTxHash("0x82f1b4c9e88d7120a5991823bc89a7413f9a718c03")
                    .blockchainTokenId("78912")
                    .smartContractAddress("0x71a2B889cFe49D1e5e78B2c56a88F932De7189cF")
                    .scanCount(1)
                    .status("ACTIVE")
                    .build();
            passportRepository.save(passport);

            // 5. Ghi log quét lần đầu tại xưởng Bát Tràng
            PassportAuditLog firstLog = PassportAuditLog.builder()
                    .passport(passport)
                    .ipAddress("118.70.182.45")
                    .userAgent("QR Verification Terminal • Workshop Studio")
                    .latitude(20.9781)
                    .longitude(105.9125)
                    .city("Hà Nội")
                    .country("VN")
                    .isAnomaly(false)
                    .build();
            auditLogRepository.save(firstLog);
        }

        ArtisanProfile defaultArtisan = artisanProfileRepository.findAll().stream().findFirst().orElse(null);

        // 6. Dữ liệu Bản đồ số GIS
        if (mapLocationRepository.count() == 0) {
            MapLocation loc1 = MapLocation.builder()
                    .craftVillage(batTrangPersisted)
                    .title("Lò Bầu Cổ Bát Tràng Thế Kỷ 19")
                    .category("HISTORICAL_SITE")
                    .description("Lò nung gốm cổ còn nguyên vẹn 5 bầu nung truyền thống.")
                    .latitude(20.978123)
                    .longitude(105.912845)
                    .approvalStatus("APPROVED")
                    .reviewScope("VILLAGE")
                    .images("[\"https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80\"]")
                    .build();
            MapLocation loc2 = MapLocation.builder()
                    .craftVillage(batTrangPersisted)
                    .title("Xưởng Vuốt Gốm Bùi Gia")
                    .category("WORKSHOP")
                    .description("Không gian trải nghiệm làm gốm và giao lưu cùng nghệ nhân ưu tú.")
                    .latitude(20.978900)
                    .longitude(105.913500)
                    .approvalStatus("APPROVED")
                    .reviewScope("VILLAGE")
                    .images("[\"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80\"]")
                    .build();
            MapLocation loc3 = MapLocation.builder()
                    .craftVillage(batTrangPersisted)
                    .title("Cổng Làng Cổ Bát Tràng")
                    .category("CHECKIN_POINT")
                    .description("Cổng tam quan cổ kính dẫn vào làng gốm Bát Tràng.")
                    .latitude(20.977200)
                    .longitude(105.911800)
                    .approvalStatus("APPROVED")
                    .reviewScope("VILLAGE")
                    .build();
            mapLocationRepository.saveAll(List.of(loc1, loc2, loc3));
            log.info("[DATA_INIT] Đã khởi tạo hoàn tất điểm di sản trên bản đồ GIS!");
        }

        // 7. Bài viết Tạp chí văn hóa di sản
        if (articleRepository.count() == 0) {
            HeritageArticle article = HeritageArticle.builder()
                    .title("Huyền thoại Men Lam & Men Rạn Bát Tràng: 700 năm ngọn lửa hồng bất tử")
                    .slug("huyen-thoai-men-lam-men-ran-bat-trang")
                    .excerpt("Hành trình tìm lại công thức men rạn thất truyền từ thời nhà Mạc và câu chuyện người nghệ nhân gìn giữ ngọn lửa lò bầu cổ.")
                    .content("<p>Trải qua hơn 7 thế kỷ bên dòng sông Hồng đỏ nặng phù sa, làng gốm Bát Tràng không chỉ là nơi sản xuất những vật dụng sinh hoạt thường ngày mà còn là cái nôi kết tinh tinh hoa văn hóa đất Việt.</p><p>Kỹ thuật chế tác men rạn đòi hỏi sự hiểu biết sâu sắc về hệ số giãn nở nhiệt giữa xương gốm và lớp men phủ ngoài...</p>")
                    .coverImageUrl("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80")
                    .audioInterviewUrl("https://audio.domain.vn/interviews/nghe-nhan-bui-gia-gom.mp3")
                    .videoInterviewUrl("https://youtube.com/watch?v=sample-gom-battrang")
                    .craftVillage(batTrangPersisted)
                    .artisan(defaultArtisan)
                    .viewsCount(142)
                    .status("PUBLISHED")
                    .publishedAt(Instant.now())
                    .build();
            articleRepository.save(article);
            log.info("[DATA_INIT] Đã khởi tạo bài viết Tạp chí văn hóa di sản mẫu!");
        }

        // 8. Tour trải nghiệm làng nghề
        if (tourRepository.count() == 0) {
            HeritageTour tour = HeritageTour.builder()
                    .craftVillage(batTrangPersisted)
                    .artisan(defaultArtisan)
                    .title("Trải nghiệm Đôi tay Vuốt Gốm Cổ Truyền cùng Nghệ nhân Bát Tràng")
                    .description("Khóa học thực cảnh 3.5 giờ tại lò cổ Bát Tràng. Quý khách tự tay nhào đất, vuốt gốm trên bàn xoay truyền thống, tự tay vẽ men lam và nung sản phẩm đem về làm kỷ niệm.")
                    .pricePerPerson(new BigDecimal("350000.00"))
                    .durationHours(3.5)
                    .maxSlotsPerSession(15)
                    .includedMaterials("1 khối đất sét trắng Cao Lanh, bộ cọ vẽ men chàm, tạp dề thủ công, dịch vụ nung khử 1280°C và đóng gói hộp di sản.")
                    .images("[\"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80\"]")
                    .status("ACTIVE")
                    .build();
            tourRepository.save(tour);
            log.info("[DATA_INIT] Đã khởi tạo Tour trải nghiệm làng nghề mẫu!");
        }

        // 9. Chiến dịch gây quỹ bảo tồn
        if (campaignRepository.count() == 0) {
            CrowdfundingCampaign campaign = CrowdfundingCampaign.builder()
                    .craftVillage(batTrangPersisted)
                    .targetArtisan(defaultArtisan)
                    .title("Phục dựng Lò Bầu Cổ Thất Truyền Thế Kỷ 19 tại Làng Gốm Bát Tràng")
                    .storyContent("Lò bầu cổ 5 bầu nung củi cuối cùng của làng Bát Tràng đang đứng trước nguy cơ xuống cấp trầm trọng. Dự án gây quỹ nhằm mua sắm vật liệu gạch chịu lửa, phục dựng lại nguyên trạng 5 bầu lò để tổ chức các buổi nung gốm truyền thống cho thế hệ trẻ và du khách yêu di sản.")
                    .coverImageUrl("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80")
                    .targetAmount(new BigDecimal("150000000.00"))
                    .currentAmount(new BigDecimal("48500000.00"))
                    .startDate(LocalDate.now().minusDays(10))
                    .deadline(LocalDate.now().plusDays(50))
                    .donorsCount(32)
                    .fundingType("ALL_OR_NOTHING")
                    .rewardTiers("[{\"tierId\":\"TIER_1\",\"minAmount\":200000,\"rewardTitle\":\"Bưu thiếp Di sản Tri ân\",\"description\":\"Bưu thiếp ảnh lò cổ kèm chữ ký nghệ nhân\"},{\"tierId\":\"TIER_2\",\"minAmount\":1000000,\"rewardTitle\":\"Chén Men Rạn Khắc Tên\",\"description\":\"Một chiếc chén men rạn Bát Tràng nung bằng mẻ lò phục dựng đầu tiên\"}]")
                    .status("ACTIVE")
                    .build();
            campaignRepository.save(campaign);
            log.info("[DATA_INIT] Đã khởi tạo Chiến dịch gây quỹ bảo tồn di sản mẫu!");
        }

        // 10. Tạo các tài khoản chuẩn cho 4 vai trò (Role-Based Testing & Dev Switcher)
        if (userRepository.findByEmail("customer@heritage.vn").isEmpty() && userRepository.findByPhone("0912345678").isEmpty()) {
            User customer = User.builder()
                    .email("customer@heritage.vn")
                    .phone("0912345678")
                    .fullName("Lê Minh Anh (Du khách)")
                    .passwordHash(passwordEncoder.encode("Heritage@2026"))
                    .role("ROLE_CUSTOMER")
                    .status("ACTIVE")
                    .build();
            userRepository.save(customer);
            log.info("[DATA_INIT] Đã khởi tạo tài khoản Khách hàng: customer@heritage.vn");
        }

        if (userRepository.findByEmail("village.admin@heritage.vn").isEmpty() && userRepository.findByPhone("0923456789").isEmpty()) {
            User villageAdmin = User.builder()
                    .email("village.admin@heritage.vn")
                    .phone("0923456789")
                    .fullName("Nguyễn Văn Hùng (Trưởng Ban Quản Lý)")
                    .passwordHash(passwordEncoder.encode("Heritage@2026"))
                    .role("ROLE_VILLAGE_ADMIN")
                    .status("ACTIVE")
                    .build();
            userRepository.save(villageAdmin);
            log.info("[DATA_INIT] Đã khởi tạo tài khoản Quản lý Làng: village.admin@heritage.vn");
        }

        if (userRepository.findByEmail("superadmin@heritage.vn").isEmpty() && userRepository.findByPhone("0934567890").isEmpty()) {
            User superAdmin = User.builder()
                    .email("superadmin@heritage.vn")
                    .phone("0934567890")
                    .fullName("Cục Di Sản Văn Hóa Quốc Gia")
                    .passwordHash(passwordEncoder.encode("Heritage@2026"))
                    .role("ROLE_SUPER_ADMIN")
                    .status("ACTIVE")
                    .build();
            userRepository.save(superAdmin);
            log.info("[DATA_INIT] Đã khởi tạo tài khoản Super Admin: superadmin@heritage.vn");
        }

        User defaultCustomer = userRepository.findByEmail("customer@heritage.vn")
                .or(() -> userRepository.findByPhone("0912345678"))
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElse(null);
        Product defaultProduct = productRepository.findAll().stream().findFirst().orElse(null);

        // 11. Tạo các Đơn hàng mẫu ở 4 trạng thái cho Kanban Nghệ Nhân & Escrow
        if (orderRepository.count() == 0 && defaultCustomer != null && defaultProduct != null && defaultArtisan != null) {
            // Đơn 1: Chờ chuẩn bị (PREPARING)
            com.heritage.platform.modules.order.entity.Order o1 = com.heritage.platform.modules.order.entity.Order.builder()
                    .orderCode("VN-20261001-A101")
                    .customer(defaultCustomer)
                    .totalAmount(defaultProduct.getPrice())
                    .shippingFee(BigDecimal.ZERO)
                    .finalAmount(defaultProduct.getPrice())
                    .paymentMethod("VIETQR")
                    .paymentStatus("PENDING")
                    .shippingStatus("PREPARING")
                    .shippingAddress("Số 45 Tràng Tiền, Hoàn Kiếm, Hà Nội (Người nhận: Lê Minh Anh, SĐT: 0912345678)")
                    .build();
            com.heritage.platform.modules.order.entity.OrderItem item1 = com.heritage.platform.modules.order.entity.OrderItem.builder()
                    .order(o1)
                    .product(defaultProduct)
                    .unitPrice(defaultProduct.getPrice())
                    .quantity(1)
                    .subtotal(defaultProduct.getPrice())
                    .build();
            o1.getItems().add(item1);
            orderRepository.save(o1);
            escrowService.createEscrowHold(o1, defaultArtisan, defaultProduct.getPrice());

            // Đơn 2: Đang chế tác (CRAFTING)
            com.heritage.platform.modules.order.entity.Order o2 = com.heritage.platform.modules.order.entity.Order.builder()
                    .orderCode("VN-20260928-B202")
                    .customer(defaultCustomer)
                    .totalAmount(defaultProduct.getPrice())
                    .shippingFee(BigDecimal.ZERO)
                    .finalAmount(defaultProduct.getPrice())
                    .paymentMethod("VIETQR")
                    .paymentStatus("PAID")
                    .shippingStatus("CRAFTING")
                    .shippingAddress("Tầng 12 Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh (Người nhận: Trần Hải Đăng, SĐT: 0903112233)")
                    .build();
            com.heritage.platform.modules.order.entity.OrderItem item2 = com.heritage.platform.modules.order.entity.OrderItem.builder()
                    .order(o2)
                    .product(defaultProduct)
                    .unitPrice(defaultProduct.getPrice())
                    .quantity(1)
                    .subtotal(defaultProduct.getPrice())
                    .build();
            o2.getItems().add(item2);
            orderRepository.save(o2);
            escrowService.createEscrowHold(o2, defaultArtisan, defaultProduct.getPrice());

            // Đơn 3: Đã đóng gói / đang giao (SHIPPED)
            com.heritage.platform.modules.order.entity.Order o3 = com.heritage.platform.modules.order.entity.Order.builder()
                    .orderCode("VN-20260925-C303")
                    .customer(defaultCustomer)
                    .totalAmount(defaultProduct.getPrice())
                    .shippingFee(BigDecimal.ZERO)
                    .finalAmount(defaultProduct.getPrice())
                    .paymentMethod("VIETQR")
                    .paymentStatus("PAID")
                    .shippingStatus("SHIPPED")
                    .shippingAddress("Số 88 Lê Duẩn, Hải Châu, Đà Nẵng (Người nhận: Phạm Thúy Nga, SĐT: 0935889900)")
                    .build();
            com.heritage.platform.modules.order.entity.OrderItem item3 = com.heritage.platform.modules.order.entity.OrderItem.builder()
                    .order(o3)
                    .product(defaultProduct)
                    .unitPrice(defaultProduct.getPrice())
                    .quantity(1)
                    .subtotal(defaultProduct.getPrice())
                    .build();
            o3.getItems().add(item3);
            orderRepository.save(o3);
            escrowService.createEscrowHold(o3, defaultArtisan, defaultProduct.getPrice());

            // Đơn 4: Giao thành công (DELIVERED)
            com.heritage.platform.modules.order.entity.Order o4 = com.heritage.platform.modules.order.entity.Order.builder()
                    .orderCode("VN-20260920-D404")
                    .customer(defaultCustomer)
                    .totalAmount(defaultProduct.getPrice())
                    .shippingFee(BigDecimal.ZERO)
                    .finalAmount(defaultProduct.getPrice())
                    .paymentMethod("VIETQR")
                    .paymentStatus("PAID")
                    .shippingStatus("DELIVERED")
                    .shippingAddress("Biệt thự Hoa Sữa 03, Vinhomes Riverside, Long Biên, Hà Nội")
                    .build();
            com.heritage.platform.modules.order.entity.OrderItem item4 = com.heritage.platform.modules.order.entity.OrderItem.builder()
                    .order(o4)
                    .product(defaultProduct)
                    .unitPrice(defaultProduct.getPrice())
                    .quantity(1)
                    .subtotal(defaultProduct.getPrice())
                    .build();
            o4.getItems().add(item4);
            orderRepository.save(o4);
            escrowService.createEscrowHold(o4, defaultArtisan, defaultProduct.getPrice());

            log.info("[DATA_INIT] Đã khởi tạo 4 đơn hàng mẫu ở 4 trạng thái Kanban cho Nghệ nhân!");
        }

        // 12. Tạo lịch sử giao dịch Ví Nghệ Nhân mẫu
        if (walletTransactionRepository.count() == 0 && defaultArtisan != null) {
            com.heritage.platform.modules.artisan.entity.WalletTransaction tx1 = com.heritage.platform.modules.artisan.entity.WalletTransaction.builder()
                    .artisan(defaultArtisan)
                    .amount(new BigDecimal("15000000.00"))
                    .transactionType("WITHDRAW")
                    .status("COMPLETED")
                    .bankName("Ngân hàng Ngoại Thương (Vietcombank)")
                    .bankAccountNumber("0011009876543")
                    .bankAccountName("BUI GIA GOM")
                    .txReference("WD-88A92B10")
                    .note("Rút tiền doanh thu mẻ gốm tháng 09/2026")
                    .build();
            com.heritage.platform.modules.artisan.entity.WalletTransaction tx2 = com.heritage.platform.modules.artisan.entity.WalletTransaction.builder()
                    .artisan(defaultArtisan)
                    .amount(new BigDecimal("9120000.00"))
                    .transactionType("ESCROW_RELEASE")
                    .status("COMPLETED")
                    .bankName("Hệ Thống Ký Quỹ Escrow")
                    .txReference("ESC-RELEASE-4412")
                    .note("Giải ngân tự động sau 7 ngày đơn hàng VN-20260915-X992")
                    .build();
            walletTransactionRepository.saveAll(List.of(tx1, tx2));
            log.info("[DATA_INIT] Đã khởi tạo lịch sử giao dịch Ví Nghệ Nhân mẫu!");
        }

        log.info("[DATA_INIT] Đã khởi tạo hoàn tất toàn bộ dữ liệu mẫu di sản, đơn hàng & cộng đồng!");
    }
}
