# QUY CHUẨN THIẾT KẾ VÀ PHÁT TRIỂN HỆ THỐNG (DEVELOPMENT CODING RULES)
## DỰ ÁN: NỀN TẢNG SỐ HÓA DI SẢN VĂN HÓA & E-COMMERCE LÀNG NGHỀ
* **Frontend:** React, TypeScript, Zustand (Immer), TanStack Query, Neo-Heritage UI Component Library
* **Backend:** Spring Boot 3.x, Spring Data JPA, Spring Security 6, PostgreSQL, Web3j

---

## 1. NGUYÊN TẮC KIẾN TRÚC & QUY ƯỚC ĐẶT TÊN (NAMING & ARCHITECTURE)

### 1.1. Quy ước Đặt tên (Naming Conventions)
* **Thư mục & Tệp tin:** Bắt buộc sử dụng `kebab-case`.
  * *Ví dụ:* `heritage-passport/`, `craft-village-map.tsx`, `use-artisan-profile.ts`, `escrow-service.java` (hoặc `EscrowService.java` theo chuẩn Java).
* **Component & Interface / Type / Class / Enum:** Bắt buộc sử dụng `PascalCase`.
  * *Ví dụ:* `PassportDetailCard`, `CraftVillageEntity`, `OrderStatusEnum`, `ArtisanProfileDto`.
* **Hooks, Functions, Methods, Variables:** Bắt buộc sử dụng `camelCase`.
  * *Ví dụ:* `useCraftVillage()`, `calculateEscrowFee()`, `isHeritageAnomaly()`, `passportCode`.
* **Hằng số (Constants):** Bắt buộc sử dụng `SCREAMING_SNAKE_CASE`.
  * *Ví dụ:* `MAX_SCAN_ANOMALY_THRESHOLD`, `DEFAULT_PAGE_SIZE`, `ESCROW_HOLD_DAYS`.
* **Cơ sở dữ liệu (PostgreSQL):** Bảng, cột, chỉ mục bắt buộc sử dụng `snake_case`.
  * *Ví dụ:* `craft_villages`, `heritage_passports`, `passport_audit_logs`, `is_anomaly`.

### 1.2. Phân tách Trách nhiệm 3 Tầng (Frontend & Backend)
* **Frontend:** Phân tách rạch ròi 3 tầng logic:
  1. `UI Layer (Component)`: Chỉ phụ trách render giao diện và bắt sự kiện người dùng.
  2. `State Management Layer (Zustand)`: Quản lý trạng thái client, thao tác qua Immer.
  3. `Data Fetching Layer (TanStack Query)`: Quản lý cache và giao tiếp API từ xa, không nhét logic UI vào service/hook API.
* **Backend:** Tuân thủ Clean Layered Architecture:
  1. `Controller Layer`: Tiếp nhận HTTP, validate dữ liệu đầu vào (`@Valid`), trả về `ApiResponse<T>`.
  2. `Service Layer`: Xử lý nghiệp vụ, quản lý Transaction (`@Transactional`), không trả về trực tiếp Entity ra ngoài API.
  3. `Repository Layer`: Giao tiếp Database qua Spring Data JPA/QueryDSL, cấm viết business logic trong Repository.

---

## 2. QUY CHUẨN FRONTEND (REACT & TYPESCRIPT)

### 2.1. Quản lý Đa ngôn ngữ & Văn bản
* **Tuyệt đối không hard-code tiếng Việt trong mã nguồn:** Toàn bộ tiêu đề, nhãn trường, thông báo lỗi, nút bấm phải đi qua hàm dịch `translate()` (hoặc `t('namespace:key')`).
* Khóa dịch thuật phải có cấu trúc phân cấp rõ ràng:
  ```json
  {
    "common": {
      "button": {
        "save": "LƯU DỮ LIỆU",
        "cancel": "THOÁT"
      },
      "validation": {
        "required": "{field} không được để trống",
        "invalidFormat": "{field} không đúng định dạng"
      }
    },
    "heritage": {
      "passport": {
        "title": "Hộ chiếu Di sản Số",
        "verifiedBadge": "Chính hãng độc bản"
      }
    }
  }
  ```

### 2.2. Giao diện & Trải nghiệm Người dùng (UI/UX Neo-Heritage)
* **Màu sắc & Thẩm mỹ Di sản:**
  * Màu nền chủ đạo của các màn hình nghiệp vụ và form là màu xám nhạt giấy Dó `#FBF9F5` hoặc `#F0F2F5`.
  * Màu chữ nhãn trường (Label): Đen `#000000`, font Tahoma/Inter, size 13px.
  * Màu chữ nhập liệu (Input text): Xanh `#1677ff` hoặc xanh chàm men lam `#1A365D`.
  * Màu nhấn hành động (CTA): Đỏ son đất nung `#C53030` hoặc xanh men ngọc `#2C7A7B`.
* **Cửa sổ & Hộp thoại (Modal):**
  * Bo góc chuẩn `8px` hoặc `12px`.
  * Chiều cao Header cố định là `56px`.
* **Thành phần UI:**
  * Bắt buộc sử dụng các Component Wrapper chuẩn hóa từ thư mục chung (`@components/ui` hoặc `@packages/components` như `CustomModalForm`, `Button`, `Table`, `Input`), cấm import tùy tiện component thô chưa bọc.
* **Trạng thái Chỉ đọc (Read-Only):**
  * Vô hiệu hóa (disable) toàn bộ các trường nhập liệu và nút điều khiển.
  * Đổi màu nền và màu nhãn sang xám nhạt `#f5f5f5`.
* **Hỗ trợ Nghệ nhân Cao tuổi (Accessibility Standard):**
  * Tại phân hệ Studio Nghệ nhân: Nút bấm có chiều cao tối thiểu $48\text{px}$, font chữ từ $16\text{px}$ trở lên, hỗ trợ nhập liệu bằng giọng nói (Speech-to-Text).

### 2.3. Quy tắc Form & Kiểm thực Dữ liệu (Form & Validation)
* **Message Thông báo lỗi:** Không hard-code message, phải ghép key động:
  ```typescript
  translate('common:validation.required', { field: translate('product:field.name') })
  ```
* **Nút bấm:** Form Thêm / Sửa / Tạo Hộ chiếu thống nhất 2 nút:
  * Nút chính: `"LƯU DỮ LIỆU"` (Nền xanh/đỏ di sản, chữ trắng, font Tahoma/Inter 13px đậm).
  * Nút phụ: `"THOÁT"` (hoặc Hủy bỏ).
* **Tự động Focus & Xử lý Chuỗi:**
  * Tự động focus con trỏ vào trường đầu tiên khi mở form/modal.
  * Các trường bắt buộc nhập phải có dấu sao `*` màu đỏ.
  * Tự động cắt tỉa (`trim()`) khoảng trắng thừa ở hai đầu trước khi gửi dữ liệu lên API. Cấm nhập chuỗi chỉ toàn khoảng trắng.
* **Ràng buộc Trường Mã (Code/Passport):**
  * Chỉ cho phép nhập chữ hoa không dấu, chữ số và gạch dưới (`A-Z`, `0-9`, `_`).
  * Khóa (disable) trường mã khi ở thao tác Sửa/Cập nhật.
* **Ràng buộc Tọa độ Địa lý (Làng nghề/Bản đồ):**
  * Vĩ độ (Latitude) bắt buộc trong khoảng $[-90.0 .. 90.0]$.
  * Kinh độ (Longitude) bắt buộc trong khoảng $[-180.0 .. 180.0]$.
* **Ràng buộc Ngày tháng:**
  * Nhập và hiển thị theo định dạng chuẩn `dd/mm/yyyy`.
  * Tự động format khi gõ số liền (VD: `26092026` $\to$ `26/09/2026`).
  * Ràng buộc `"Từ ngày"` $\le$ `"Đến ngày"`.
* **Cảnh báo Thoát Form:**
  * Nếu dữ liệu chưa bị thay đổi: Đóng form ngay lập tức khi nhấn "THOÁT" hoặc phím `Esc`.
  * Nếu dữ liệu đã bị chỉnh sửa (form dirty): Bắt buộc hiển thị popup cảnh báo: *"Dữ liệu đã bị thay đổi. Bạn có muốn thoát không?"*.

### 2.4. Quy tắc Bảng Dữ liệu & Bộ lọc (Table Grid & Filters)
* **Bảng chỉ dùng để render UI:** Nghiệp vụ gọi API hoặc biến đổi dữ liệu phải nằm ở Hook/Service.
* **Hành vi Con trỏ Bảng:**
  * Gọi `focusRowByTableAction` khi Thêm/Sửa/Xóa thành công để highlight dòng vừa tác động.
  * Gọi `clearFocusedRow` khi Tìm kiếm/Reset/Xuất báo cáo.
* **Quy cách Cột Bảng:**
  * Cột Số thứ tự (STT): Cố định độ rộng `60px`, căn giữa.
  * Cột Thao tác (Action): Cố định độ rộng `130px`, sử dụng icon thẳng hàng thay vì chữ.
  * Căn lề: Chuỗi văn bản căn trái; Tiền tệ, số lượng căn phải; Ngày tháng, trạng thái căn giữa.
* **Bộ lọc Header:**
  * Bắt buộc có cơ chế `debounce (500ms)` khi người dùng gõ tìm kiếm.
  * Lấy state mới nhất bằng `useStore.getState()` trong timer để tránh lỗi stale closure.
  * Tự động đưa về trang 1 khi tiêu chí lọc thay đổi.

---

## 3. QUY CHUẨN BACKEND (SPRING BOOT 3.X & JPA)

### 3.1. Chuẩn hóa Phản hồi API (API Response Standards)
Mọi REST API đều phải bọc trong cấu trúc chuẩn:
```java
public class ApiResponse<T> {
    private boolean success;
    private String code;         // e.g., "SUCCESS", "HERITAGE_ANOMALY_DETECTED"
    private String message;
    private T data;
    private Instant timestamp = Instant.now();
}
```
* Đối với danh sách phân trang, sử dụng `PagedResponse<T>` chứa `content`, `page`, `size`, `totalElements`, `totalPages`.

### 3.2. Quy chuẩn Xử lý Ngoại lệ (Global Exception Handling)
* Sử dụng `@RestControllerAdvice` để bắt lỗi tập trung:
  * `MethodArgumentNotValidException`: Trả về mã HTTP `400` kèm danh sách chi tiết các trường bị lỗi.
  * `EntityNotFoundException`: Trả về mã HTTP `404`.
  * `BusinessException`: Lỗi nghiệp vụ chuyên biệt (VD: `PassportAlreadyMintedException`, `InsufficientWalletBalanceException`) kèm HTTP `422`.
* Tuyệt đối không nuốt Exception (Empty catch block); phải ghi log kèm Request ID và Context qua SLF4J:
  ```java
  log.error("[ESCROW_PAYOUT_FAILED] OrderId={}, Reason={}", orderId, ex.getMessage(), ex);
  ```

### 3.3. Quy tắc Tính toán Tiền tệ & Giao dịch (Financial Precision)
* **Kiểu dữ liệu tiền tệ:** Bắt buộc sử dụng `BigDecimal` cho giá bán, phí ký quỹ, số dư ví. Tuyệt đối không dùng `float` hay `double` vì lỗi làm tròn số thực.
* **Phòng chống chia cho 0:** Trước mọi phép tính chia tỷ lệ hoa hồng hoặc phần trăm gây quỹ, bắt buộc kiểm tra mẫu số khác 0:
  ```java
  BigDecimal percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0 
      ? partAmount.divide(totalAmount, 4, RoundingMode.HALF_UP) 
      : BigDecimal.ZERO;
  ```
* **Chống Race Condition (Khóa đồng thời):** Thao tác rút tiền hoặc giải ngân ký quỹ phải sử dụng Pessimistic Lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) hoặc Optimistic Lock với cột `@Version`.

### 3.4. Chiến lược Xóa mềm & Truy vấn JPA
* Các bảng danh mục, nghệ nhân, tác phẩm và đơn hàng áp dụng xóa mềm:
  ```java
  @SQLDelete(sql = "UPDATE products SET is_deleted = true, updated_at = NOW() WHERE id = ?")
  @Where(clause = "is_deleted = false")
  ```
* **Tối ưu hóa Truy vấn:**
  * Tuyệt đối không dùng `FetchType.EAGER` trên quan hệ `@OneToMany` hoặc `@ManyToMany` để tránh bùng nổ query $N+1$.
  * Sử dụng `@EntityGraph` hoặc `JOIN FETCH` khi cần tải kèm các quan hệ liên quan.

---

## 4. QUY CHUẨN ĐẶC THÙ NGHIỆP VỤ DI SẢN & BLOCKCHAIN

### 4.1. Hộ chiếu Di sản & Băm Chứng thực (Verification Hash)
* Trước khi lưu Hộ chiếu Di sản, hệ thống bắt buộc tính toán chuỗi băm bảo mật SHA-256 đối chiếu:
  $$\text{verification\_hash} = \text{SHA-256}(\text{artisan\_id} + \text{product\_id} + \text{secret\_salt} + \text{created\_at})$$
* Mã hash này được đối chiếu trực tiếp với Transaction Hash trên Blockchain Explorer để chứng minh dữ liệu chưa từng bị can thiệp trái phép.

### 4.2. Xử lý Quét QR/NFC Bất đồng bộ & Thuật toán Chống Hàng giả
* **Ghi nhận lượt quét:** Luồng quét mã công khai không được làm chậm thời gian tải trang của người dùng. Tác vụ ghi vào bảng `passport_audit_logs` phải được đẩy vào `@Async` hoặc Message Queue.
* **Thuật toán Tốc độ di chuyển bất khả thi (Impossible Travel Velocity):**
  * Lấy tọa độ quét lần trước $(lat_1, lon_1)$ lúc $t_1$ và tọa độ quét hiện tại $(lat_2, lon_2)$ lúc $t_2$.
  * Tính khoảng cách theo công thức Haversine: $D\text{ (km)}$.
  * Tính vận tốc: $V = \frac{D}{\Delta t\text{ (giờ)}}$.
  * Nếu $V > 900\text{ km/h}$ (vượt quá vận tốc bay thương mại) hoặc $D > 100\text{ km}$ trong thời gian $\Delta t < 5\text{ phút}$:
    $\implies$ Đánh dấu `is_anomaly = true` và đổi trạng thái Hộ chiếu sang `FLAGGED_ANOMALY`.

### 4.3. Quản lý Tài nguyên 3D & Phương tiện
* File mô hình 3D (.glb/.gltf) phải được nén qua Draco Compression, dung lượng tối đa không vượt quá $15\text{MB}$.
* File ảnh đính kèm giới hạn tối đa $10\text{MB}$, bắt buộc định dạng chuẩn `.webp`, `.png` hoặc `.jpg`.
* File Excel nhập/xuất dữ liệu bắt buộc định dạng `.xlsx`.

---

## 5. QUY CHUẨN BẢO MẬT & TRẢI NGHIỆM HỆ THỐNG

### 5.1. Tiêu đề Popup & Thông báo Đồng bộ
* Tiêu đề của toàn bộ hộp thoại thông báo trong hệ thống thống nhất là **`"BHTT"`** (hoặc tiền tố nhận diện dự án chính thức).
* Sử dụng đúng bộ biểu tượng chuẩn theo từng ngữ cảnh:
  * `MESSAGE` (Thông tin): Icon Thông tin màu xanh.
  * `WARNING` (Cảnh báo): Icon Tam giác vàng cảnh báo.
  * `ERROR` (Lỗi): Icon Dấu chéo đỏ.
  * `CONFIRM` (Xác nhận): Icon Hỏi chấm xanh.
* Tự động focus vào nút bấm đầu tiên của popup khi mở. Hỗ trợ phím `Esc` để đóng.

### 5.2. Chặn Spam & Bảo vệ API Công khai (Rate Limiting)
* Endpoint tra cứu Hộ chiếu di sản công khai (`/api/v1/public/passports/{code}`) áp dụng Bucket4j / Redis Rate Limiter: Tối đa 60 requests/phút trên mỗi IP để ngăn chặn bot quét brute-force mã QR.

### 5.3. Quy chuẩn Điều hướng & Phím tắt
* Phím `Tab` di chuyển tuần tự từ trên xuống dưới, từ trái sang phải, tự động bỏ qua các trường đã bị `disabled` hoặc `read-only`.
* Hỗ trợ mở đa tab làm việc trên trình duyệt mà không gây xung đột (cấm dùng biến static hoặc singleton cục bộ để lưu trữ ID của phiên làm việc).

---
*Bản quy chuẩn này là căn cứ duyệt Pull Request (PR) và tiêu chuẩn đánh giá chất lượng mã nguồn bắt buộc cho toàn bộ đội ngũ phát triển dự án.*
