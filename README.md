# NỀN TẢNG SỐ HÓA DI SẢN VĂN HÓA & THƯƠNG MẠI ĐIỆN TỬ LÀNG NGHỀ TRUYỀN THỐNG (DiSan360)

> **Hệ sinh thái số hóa di sản toàn diện**: Kết nối Du khách, Nghệ nhân, Ban Quản lý Làng nghề và Cơ quan Quản lý Văn hóa Quốc gia thông qua công nghệ Bản sao số (Digital Twin), Bản đồ di sản PostGIS, Hộ chiếu số Blockchain, Ký quỹ thương mại (Escrow 7 ngày), và Studio tạo tác thông minh.

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

**DiSan360** là giải pháp công nghệ chuyển đổi số quốc gia cho các làng nghề truyền thống Việt Nam (Gốm Bát Tràng, Lụa Vạn Phúc, Sơn Mài Hạ Thái, Đúc Đồng Đại Bái...). Hệ thống giải quyết 4 thách thức cốt lõi:
1. **Nạn hàng giả, hàng nhái di sản**: Loại bỏ hàng giả bằng **Hộ Chiếu Di Sản Số (Digital Passport)** gắn tem vỡ vật lý (Breakable Decal QR + Serial + Mã Cào Bảo Mật) đối soát mã băm Merkle Root trên Blockchain.
2. **Bảo vệ quyền lợi khách hàng & nghệ nhân**: Áp dụng **Ký Quỹ Escrow 7 Ngày** với cơ chế tự động thanh toán (VietQR) và bảo lưu dòng tiền cho đến khi khách nhận và thẩm định tác phẩm thành công.
3. **Rào cản công nghệ cho nghệ nhân cao tuổi**: **Studio Nghệ Nhân 2.0 (Dirty Hand Mode)** hỗ trợ nhập liệu bằng giọng nói tiếng Việt (Voice-to-Text), chụp ảnh tự nén trên di động, bảng Kanban điều vận $\ge 48\text{px}$, và Ví rút tiền về tài khoản ngân hàng.
4. **Phát triển du lịch trải nghiệm & nguồn lực bảo tồn**: Cung cấp phân hệ **Đặt Tour Trải Nghiệm** (khóa chỗ 15 phút, vé QR), **Gây Quỹ Bảo Tồn Di Sản** (All-or-Nothing refund), và **Tạp Chí Di Sản Văn Hóa**.

---

## 2. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

Hệ thống được thiết kế theo kiến trúc chuẩn Clean Architecture / Micro-modular, phân tách rạch ròi giữa Presentation, Business Logic, State Management và Persistence.

```
                              ┌──────────────────────────────────────────────┐
                              │            REACT 18 + TYPESCRIPT             │
                              │  (Neo-Heritage UI: Giấy Dó, Men Lam, Chu Sa) │
                              └──────────────────────┬───────────────────────┘
                                                     │ REST API / Bearer JWT
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SPRING BOOT 3.3.4 BACKEND CORE                                   │
├────────────────────┬────────────────────┬────────────────────┬───────────────────┬─────────────────┤
│   MODULE AUTH &    │   MODULE PASSPORT  │    MODULE ORDER    │  MODULE ARTISAN   │ MODULE COMMUNITY│
│      SECURITY      │   & BLOCKCHAIN     │      & ESCROW      │   STUDIO & WALLET │  TOURS & FUNDS  │
├────────────────────┼────────────────────┼────────────────────┼───────────────────┼─────────────────┤
│ • JWT Authentication│ • Serial + Scratch │ • Giỏ hàng di sản  │ • Kanban điều vận │ • Đặt tour giữ  │
│ • 4 Roles: Customer│ • Merkle Root Tree │ • VietQR tự động   │ • Bàn xoay giọng  │   chỗ 15 phút   │
│   Artisan, Village │ • Haversine Anomaly│ • Escrow 7 ngày    │   nói tiếng Việt  │ • Soát vé QR    │
│   Super Admin      │   V > 900 km/h     │ • Xử lý khiếu nại  │ • Rút tiền về VCB │ • Gây quỹ di sản│
│ • Password BCrypt  │ • Zero NFC overhead│ • Cron giải ngân   │ • In tem vận đơn  │ • Tạp chí làng  │
└────────────────────┴─────────┬──────────┴─────────┬──────────┴─────────┬─────────┴────────┬────────┘
                               │                    │                    │                  │
                               ▼                    ▼                    ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE & STORAGE INFRASTRUCTURE                               │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│             POSTGRESQL 16 + POSTGIS             │                   MINIO S3 / BLOB                │
│ • Bảng tọa độ không gian (Heritage GIS Map)     │ • Lưu trữ ảnh tác phẩm, tem chứng nhận           │
│ • Soft Delete (is_deleted = true)               │ • Mô hình 3D (.glb) nén Draco ≤ 15MB             │
│ • Khóa bi quan / lạc quan cho tài chính Escrow  │ • Ảnh nén client-side ≤ 1.5MB                    │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 3. CÁC TÁC NHÂN & VAI TRÒ HỆ THỐNG (ACTORS & ROLES)

| Vai trò (Role) | Tài khoản Demo Mặc định | Mật khẩu | Phạm vi quyền hạn & Trách nhiệm |
|---|---|---|---|
| **CUSTOMER** (Du khách / Người mua) | `customer@heritage.vn` | `Heritage@2026` | Khám phá chợ di sản, đặt mua tác phẩm với bảo vệ Escrow 7 ngày, đặt tour trải nghiệm, quyên góp bảo tồn, quét tem tra cứu hộ chiếu số. |
| **ARTISAN** (Nghệ nhân tạo tác) | `artisan.bui@heritage.vn` | `Heritage@2026` | Sử dụng Studio: Kể chuyện bằng giọng nói, chụp ảnh nén tự động, theo dõi Kanban 4 cột, in tem vận đơn, quản lý số dư ví và rút tiền về ngân hàng. |
| **VILLAGE_ADMIN** (Ban Quản lý Làng) | `village.admin@heritage.vn` | `Heritage@2026` | Thẩm định mẫu mã SKU của nghệ nhân trong làng, phát hành lô Hộ chiếu số, duyệt điểm di sản trên bản đồ GIS, điều phối tour và chiến dịch gây quỹ. |
| **SUPER_ADMIN** (Quản trị viên Di sản) | `superadmin@heritage.vn` | `Heritage@2026` | Quản trị toàn bộ làng nghề quốc gia, phân quyền tài khoản, cấu hình tham số blockchain, giám sát báo động gian lận vi phạm vật lý GPS toàn quốc. |

---

## 4. BẢNG CÔNG NGHỆ SỬ DỤNG (TECHNOLOGY STACK)

### Backend
- **Ngôn ngữ**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **ORM / Data**: Spring Data JPA, Hibernate Spatial, PostgreSQL Driver
- **Cơ sở dữ liệu**: PostgreSQL 16 + PostGIS
- **Bảo mật**: Spring Security 6, JJWT (io.jsonwebtoken 0.12.6), BCrypt Password Encoder
- **Lưu trữ Blob**: MinIO Java SDK 8.5.10 / AWS S3 Compatible
- **Định dạng tài chính**: `BigDecimal` chuẩn xác tuyệt đối, không dùng `float/double`
- **Kiểm thử**: JUnit 5, Mockito, Spring Boot Starter Test (H2 Database in-memory cho CI/CD)

### Frontend
- **Ngôn ngữ & Nền tảng**: React 18, TypeScript 5.5, Vite 5.4
- **State Management**: Zustand kết hợp Immer middleware
- **Data Fetching & Cache**: TanStack Query (React Query)
- **Thư viện Giao diện & Animation**: Tailwind CSS, Framer Motion, Lucide React
- **Bản đồ số**: Leaflet, React-Leaflet kèm điều khiển cử chỉ 2 ngón (`Gesture Handling`)
- **Tối ưu Mobile**: Nhập liệu giọng nói (Web Speech API), Client-side Image Compression qua Canvas/Worker, Dirty-hand Mode ($\ge 48\text{px}$).

---

## 5. YÊU CẦU MÔI TRƯỜNG (REQUIREMENTS)

- **Java Development Kit (JDK)**: Phiên bản 21 trở lên.
- **Node.js**: Phiên bản 18.x hoặc 20.x LTS; npm $\ge 9.x$.
- **Maven**: Phiên bản 3.9 trở lên (hoặc dùng `mvnw`).
- **PostgreSQL**: Phiên bản 16 với extension PostGIS kích hoạt.
- **Docker & Docker Compose**: Nếu triển khai bằng container.

---

## 6. CẤU HÌNH BIẾN MÔI TRƯỜNG (CONFIGURATION)

Tạo tệp `.env` tại thư mục gốc (hoặc tham khảo `.env.example`):

```bash
# Database Configuration
POSTGRES_DB=heritage_db
POSTGRES_USER=heritage_admin
POSTGRES_PASSWORD=HeritageSecure@2026
DB_HOST=localhost
DB_PORT=5432

# Backend JWT Security
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# MinIO Object Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=heritage-media

# Frontend API Base URL
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 7. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN (RUN & DEPLOY)

### Triển khai Nhanh bằng Docker Compose (Khuyến nghị)

```bash
# Khởi động toàn bộ cụm dịch vụ: PostgreSQL, MinIO, Backend, Frontend
docker compose up -d --build

# Kiểm tra log vận hành
docker compose logs -f
```

### Triển khai Thủ Công (Local Development)

#### 1. Khởi động Backend
```bash
cd be

# Chạy toàn bộ test suite để kiểm tra tính toàn vẹn (14 test cases)
mvn clean test

# Khởi chạy ứng dụng Spring Boot
mvn spring-boot:run
```
Backend sẽ khởi chạy tại cổng: `http://localhost:8080` (API Swagger Docs tại `http://localhost:8080/swagger-ui.html`). Dữ liệu mẫu (DataInitializer) sẽ tự động nạp các tài khoản người dùng, sản phẩm gốm Bát Tràng, đơn hàng mẫu, ví nghệ nhân và chiến dịch gây quỹ.

#### 2. Khởi động Frontend
```bash
cd fe

# Cài đặt thư viện phụ thuộc
npm install

# Kiểm tra biên dịch TypeScript & đóng gói Vite
npm run build

# Khởi chạy máy chủ phát triển
npm run dev
```
Frontend sẽ mở tại cổng: `http://localhost:5173`.

---

## 8. DANH MỤC API CHÍNH (KEY API ENDPOINTS)

### Phân hệ Xác thực & Người dùng (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Đăng nhập, nhận JWT token và thông tin Role.
- `POST /api/v1/auth/register`: Đăng ký tài khoản du khách.

### Phân hệ Thương Mại & Ký Quỹ Escrow (`/api/v1/orders` & `/api/v1/escrow`)
- `POST /api/v1/orders`: Tạo đơn hàng di sản mới, sinh mã bưu kiện và payload VietQR.
- `GET /api/v1/orders/my-orders`: Lấy lịch sử đơn hàng của người dùng hiện tại kèm trạng thái Escrow.
- `PUT /api/v1/orders/{id}/cancel`: Khách hàng hủy đơn hàng (khi ở trạng thái `PREPARING`).
- `POST /api/v1/escrow/{orderId}/dispute`: Đóng băng ký quỹ Escrow khi phát sinh tranh chấp/khiếu nại vỡ nứt tác phẩm.
- `POST /api/v1/escrow/{orderId}/release`: Giải ngân ký quỹ thành công cho nghệ nhân (thủ công hoặc kích hoạt tự động sau 7 ngày).

### Phân hệ Xưởng Nghệ Nhân 2.0 (`/api/v1/artisan`)
- `GET /api/v1/artisan/orders`: Lấy danh sách đơn hàng thuộc quyền chế tác của nghệ nhân.
- `PUT /api/v1/artisan/orders/{id}/status`: Cập nhật trạng thái Kanban (`PREPARING` $\to$ `CRAFTING` $\to$ `SHIPPED` $\to$ `DELIVERED`).
- `POST /api/v1/artisan/orders/{id}/shipping-label`: Khởi tạo phiếu gửi hàng & tem vận đơn tiêu chuẩn.
- `GET /api/v1/artisan/wallet`: Tra cứu số dư khả dụng, tiền đang bị giữ Escrow và tổng doanh thu.
- `POST /api/v1/artisan/wallet/withdraw`: Tạo lệnh rút tiền về tài khoản ngân hàng (VCB, MBBank, TCB...).

### Phân hệ Hộ Chiếu Số & Chống Giả (`/api/v1/passports` & `/api/v1/anti-counterfeit`)
- `GET /api/v1/passports/{passportCode}`: Tra cứu thông tin hộ chiếu số, đối soát Transaction Hash Blockchain.
- `POST /api/v1/passports/verify-scratch`: Xác thực mã cào bảo mật một lần duy nhất.
- `POST /api/v1/anti-counterfeit/scan-log`: Ghi nhận nhật ký quét QR/NFC, tự động phát hiện vi phạm di chuyển vật lý ($V > 900\text{ km/h}$).

### Phân hệ Cộng Đồng, Tour & Gây Quỹ (`/api/v1/tours` & `/api/v1/crowdfunding` & `/api/v1/articles`)
- `GET /api/v1/tours`: Danh sách tour trải nghiệm văn hóa.
- `POST /api/v1/tours/book`: Đặt tour trải nghiệm, khóa vị trí 15 phút, xuất mã VietQR thanh toán.
- `POST /api/v1/tours/verify-ticket`: Quét mã QR soát vé khách du lịch tại cổng xưởng.
- `GET /api/v1/crowdfunding`: Danh sách chiến dịch gây quỹ bảo tồn di sản.
- `POST /api/v1/crowdfunding/{id}/donate`: Quyên góp ủng hộ chiến dịch bảo tồn, sinh mã VietQR.
- `GET /api/v1/articles`: Danh mục tạp chí, phóng sự câu chuyện làng nghề.

---

## 9. KIỂM THỬ HỆ THỐNG (TESTING & QUALITY ASSURANCE)

Toàn bộ nghiệp vụ quan trọng được bao phủ bởi bộ kiểm thử tự động, tuân thủ nghiêm ngặt các quy tắc xử lý ngoại lệ, chống race condition và bảo toàn số dư tài chính:

```bash
cd be
mvn test
```

### Kết quả kiểm thử tự động (14/14 Tests Passed - 100%):
1. **`OrderAndEscrowServiceTest`** (5 test cases):
   - `testCreateOrder_SuccessWithVietQrAndEscrow`: Xác minh tính năng tạo đơn, sinh mã VietQR và thiết lập khoản giữ Escrow 7 ngày.
   - `testCancelOrder_Success`: Xác minh hủy đơn khi đang ở trạng thái chuẩn bị.
   - `testDisputeEscrow_FreezesReleaseTimer`: Kiểm tra cơ chế đóng băng bộ đếm giải ngân tự động khi có khiếu nại.
   - `testReleaseEscrow_CreditsArtisanBalance`: Xác nhận tiền sau khi giải ngân cộng chính xác vào số dư khả dụng của nghệ nhân.
   - `testRefundEscrow_Success`: Kiểm tra hoàn tiền cho khách hàng khi tranh chấp được chấp thuận.
2. **`ArtisanWalletAndFulfillmentTest`** (4 test cases):
   - `testWithdraw_InsufficientBalance_ThrowsException`: Chặn rút tiền khi số dư khả dụng không đủ.
   - `testWithdraw_Success_DeductsBalance`: Trừ chính xác số dư và ghi nhận lịch sử giao dịch rút tiền.
   - `testUpdateOrderStatus_TransitionsCorrectly`: Kiểm tra chuyển đổi trạng thái trên bảng Kanban.
   - `testGenerateShippingLabel_Success`: Kiểm tra sinh mã vận đơn và định dạng phiếu gửi hàng.
3. **`CommunityPreservationAndTourTest`** (4 test cases):
   - `testBookTour_LocksSlot15Minutes`: Khóa chỗ giữ chỗ 15 phút và phát hành mã vé QR.
   - `testCancelTourBooking_24HoursRule`: Cho phép hủy vé và hoàn tiền nếu trước giờ khởi hành $\ge 24\text{h}$.
   - `testCrowdfunding_DonateWithZeroDivisionSafety`: Bảo vệ triệt để lỗi chia cho 0 khi tính toán tỷ lệ phần trăm tiến độ gây quỹ.
   - `testAntiCounterfeit_DetectsImpossibleTravel`: Kích hoạt cờ cảnh báo bất thường `FLAGGED_ANOMALY` khi hai lần quét liên tiếp vượt vận tốc $900\text{ km/h}$.
4. **`HeritagePlatformApplicationTests`** (1 test case):
   - `contextLoads`: Khởi tạo thành công toàn bộ ApplicationContext Spring Boot 3.3.4.

---

## 10. TUÂN THỦ QUY CHUẨN DỰ ÁN (AGENT RULES & GUIDELINES)

- **Giao diện & Thông báo**:
  - Tiêu đề toàn bộ thông báo / popup thống nhất là **`"BHTT"`** (Bảo Hộ Tác Phẩm).
  - Nút bấm biểu mẫu thống nhất: **`"LƯU DỮ LIỆU"`** và **`"THOÁT"`**.
  - Font chữ Tahoma 13px, nhãn trường màu đen `#000000`, chữ nhập liệu màu xanh men lam `#1677ff` hoặc men gốm.
  - Xử lý phím `Esc` và hộp thoại xác nhận khi dữ liệu bị thay đổi: *"Dữ liệu đã bị thay đổi. Bạn có muốn thoát không?"*.
- **Thiết kế thân thiện thợ thủ công (Dirty Hand Ergonomics)**:
  - Nút bấm màn hình xưởng nghệ nhân có chiều cao $\ge 48\text{px}$ và $\ge 56\text{px}$, tương phản cực cao.
  - Tự động nén ảnh client-side về dung lượng $\le 1.5\text{MB}$ trước khi tải lên MinIO S3 nhằm tiết kiệm băng thông 4G.
  - Tích hợp nhận dạng giọng nói tiếng Việt kể chuyện nghề trực tiếp vào hồ sơ tác phẩm.

---

*DiSan360 - Vì sự trường tồn và thăng hoa của Di sản Thủ công Truyền thống Việt Nam.*
