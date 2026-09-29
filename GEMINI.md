# ANTIGRAVITY / GEMINI RULES: NỀN TẢNG SỐ HÓA DI SẢN VĂN HÓA & E-COMMERCE LÀNG NGHỀ

Toàn bộ quá trình lập trình (Frontend & Backend) trong dự án này BẮT BUỘC tuân thủ nghiêm ngặt các quy chuẩn sau:

---

## 1. NGUYÊN TẮC KIẾN TRÚC & ĐẶT TÊN
* **Tệp tin & Thư mục:** Dùng `kebab-case` (ví dụ: `heritage-passport/`, `craft-village-map.tsx`, `use-artisan-profile.ts`).
* **Component & Interface / Type / Class / Enum:** Dùng `PascalCase` (ví dụ: `PassportDetailCard`, `CraftVillageEntity`, `OrderStatusEnum`).
* **Hooks, Functions, Methods, Variables:** Dùng `camelCase` (ví dụ: `useCraftVillage()`, `calculateEscrowFee()`, `passportCode`).
* **Hằng số (Constants):** Dùng `SCREAMING_SNAKE_CASE` (ví dụ: `MAX_SCAN_ANOMALY_THRESHOLD`, `DEFAULT_PAGE_SIZE`).
* **Database (PostgreSQL):** Bảng, cột, khóa dùng `snake_case` (ví dụ: `craft_villages`, `heritage_passports`, `is_anomaly`).

---

## 2. QUY CHUẨN FRONTEND (REACT + TYPESCRIPT)
* **Phân tách 3 tầng logic:**
  1. `UI Layer (Component)`: Chỉ render UI và nhận sự kiện.
  2. `State Management (Zustand + Immer)`: Quản lý client state, mutate an toàn qua Immer.
  3. `API Layer (TanStack Query)`: Quản lý fetching, cache, revalidate. Không gọi UI Action từ Service layer.
* **Đa ngôn ngữ & Văn bản:** Tuyệt đối KHÔNG hard-code tiếng Việt trong code; bắt buộc dùng hàm `translate()` từ locale với key phân cấp.
* **Thẩm mỹ UI "Neo-Heritage":**
  * Màu nền: Giấy Dó `#FBF9F5` hoặc xám nhạt `#F0F2F5`.
  * Typography: Nhãn trường đen `#000000`, size 13px. Chữ nhập liệu màu xanh men lam `#1A365D` hoặc `#1677ff`.
  * Điểm nhấn (CTA): Đỏ gạch son đất nung `#C53030`, men ngọc Celadon `#2C7A7B`.
  * Modal: Bo góc `8px`, Header cố định `56px`.
  * Read-only: Disable toàn bộ trường và đổi nền sang `#f5f5f5`.
* **Form & Validation:**
  * Message lỗi ghép key động: `translate('common:validation.required', { field: translate('...') })`.
  * Nút bấm form: Thống nhất 2 nút `"LƯU DỮ LIỆU"` và `"THOÁT"`.
  * Tự động focus trường đầu tiên khi mở form.
  * Tự động `trim()` khoảng trắng thừa trước khi lưu; cấm nhập toàn khoảng trắng.
  * Trường mã code: Chỉ cho phép chữ hoa không dấu, số, gạch dưới (`A-Z, 0-9, _`) và BẮT BUỘC disable khi Sửa.
  * Ngày tháng: Định dạng `dd/mm/yyyy`, tự động format khi nhập chuỗi số liền, ràng buộc `Từ ngày <= Đến ngày`.
  * Thoát form: Thoát ngay nếu form chưa dirty; nếu có thay đổi bắt buộc confirm: *"Dữ liệu đã bị thay đổi. Bạn có muốn thoát không?"*.
* **Table & Grid:**
  * Bảng chỉ render UI, không chứa business logic.
  * Gọi `focusRowByTableAction` khi Create/Update/Delete thành công; gọi `clearFocusedRow` khi Search/Reset.
  * Phân trang mặc định 10 bản ghi. Cột STT rộng `60px`. Cột Action rộng `130px` (dùng icon thẳng hàng thay cho chữ).
  * Lọc tìm kiếm bắt buộc dùng `debounce (500ms)`, lấy state mới nhất bằng `useStore.getState()`, tự reset về trang 1 khi lọc thay đổi.
* **Accessibility cho Nghệ nhân:**
  * Studio Nghệ nhân ưu tiên nút bấm lớn $\ge 48\text{px}$, font $\ge 16\text{px}$, tích hợp nhập liệu giọng nói (Voice-to-Text).

---

## 3. QUY CHUẨN BACKEND (SPRING BOOT 3.X & JPA)
* **Kiến trúc phân tầng:** Controller $\to$ Service (`@Transactional`) $\to$ Repository (Spring Data JPA).
* **Chuẩn hóa API Response:** Mọi endpoint trả về đối tượng chuẩn `ApiResponse<T>` hoặc `PagedResponse<T>`.
* **Xử lý Ngoại lệ:** Tập trung qua `@RestControllerAdvice`. Không bao giờ nuốt ngoại lệ (empty catch); ghi log kèm Request Context qua SLF4J.
* **Tiền tệ & Ký quỹ (Escrow):**
  * Tiền tệ BẮT BUỘC dùng `BigDecimal` (cấm tuyệt đối dùng `float/double`).
  * Phòng chống triệt để lỗi chia cho 0.
  * Thao tác tài chính / số dư ví phải dùng Pessimistic/Optimistic Lock để chống Race Condition.
* **Bảo toàn dữ liệu & Truy vấn JPA:**
  * Xóa mềm (`is_deleted = true`, status = `'DELETED'/'ARCHIVED'`) cho sản phẩm, nghệ nhân, làng nghề, đơn hàng.
  * CẤM dùng `FetchType.EAGER` trên Collection để loại trừ lỗi $N+1$; sử dụng `@EntityGraph` hoặc `JOIN FETCH`.

---

## 4. QUY CHUẨN ĐẶC THÙ DI SẢN & BLOCKCHAIN
* **Bảo toàn tính bất biến Hộ chiếu:** Tính mã băm `verification_hash = SHA-256(artisan_id + product_id + created_at + salt)` đối chiếu trực tiếp với Transaction Hash trên Blockchain Ledger.
* **Chống hàng giả (Anti-Counterfeit):** Tác vụ ghi log quét QR/NFC phải xử lý bất đồng bộ (`@Async`). Thuật toán tự động kích hoạt cảnh báo `FLAGGED_ANOMALY` nếu phát hiện tốc độ di chuyển bất khả thi ($V > 900\text{ km/h}$ hoặc $D > 100\text{ km}$ trong $\Delta t < 5\text{ phút}$).
* **Tài nguyên 3D/AR:** File mô hình 3D (.glb/.gltf) nén Draco tối đa $15\text{MB}$; ảnh đính kèm tối đa $10\text{MB}$. File Excel bắt buộc `.xlsx`.

---

## 5. THÔNG BÁO & HỆ THỐNG
* Title của toàn bộ popup/thông báo thống nhất là **`"BHTT"`**.
* Dùng đúng bộ Icon: `MESSAGE`, `WARNING`, `ERROR`, `CONFIRM`. Auto-focus nút đầu tiên, hỗ trợ phím `Esc` để đóng và `Tab` để di chuyển.

---

## 6. QUY CHUẨN TỐI ƯU HIỆU NĂNG, MOBILE UX & XỬ LÝ BẤT ĐỒNG BỘ
* **Xử lý Bất đồng bộ Merkle Root & Blockchain (Sprint 4):**
  Khi gọi `PUT /api/v1/villages/batches/{batchId}/review`, tác vụ gom hash Merkle Root và gửi transaction on-chain BẮT BUỘC bọc trong `@Async` Service kết hợp Spring `ApplicationEventPublisher` (hàng đợi sự kiện). API phải phản hồi ngay lập tức cho Quản lý làng trên giao diện di động (`HTTP 200/202`), tuyệt đối không bắt client chờ mạng blockchain xác nhận block.
* **Cấu hình Leaflet Gesture Handling trên Mobile (Sprint 3):**
  Bản đồ Leaflet trên giao diện di động BẮT BUỘC kích hoạt tính năng điều khiển cử chỉ hai ngón (`gestureHandling: true` hoặc chặn single-finger touch drag), yêu cầu người dùng vuốt bằng 2 ngón tay trên màn hình cảm ứng để di chuyển bản đồ, kèm tooltip chỉ dẫn: *"Dùng 2 ngón tay để di chuyển bản đồ"*, loại bỏ triệt để hiện tượng kẹt tay không cuộn được trang web.
* **Cơ chế Nén ảnh Client-side trước khi Upload (Sprint 2):**
  Khi chụp ảnh từ Camera thiết bị di động (`capture="environment"`), kích thước file gốc có thể lên tới $5\text{ MB} - 10\text{ MB}$. Phía Frontend BẮT BUỘC tự động nén ảnh tại client (Client-side Compression qua Canvas / Web Worker) về dung lượng $\le 1.5\text{ MB}$ trước khi gọi `POST /api/v1/media/upload`, nhằm tiết kiệm băng thông 4G và đẩy nhanh tốc độ tải lên MinIO S3.

