# HƯỚNG DẪN TRIỂN KHAI LÊN SERVER UBUNTU & PUBLIC RA INTERNET
**Dự án:** Nền tảng Di sản Văn hóa & Thương mại Điện tử Làng nghề Truyền thống  
**Hệ điều hành Server:** Ubuntu 22.04 LTS / 24.04 LTS  

---

## 🎯 CÂU TRẢ LỜI CHO BẠN
> **ĐÚNG VẬY!** Toàn bộ hệ thống Backend (Spring Boot 3, Java 21), Frontend (React SPA, Nginx), Cơ sở dữ liệu (PostGIS) và Kho lưu trữ (MinIO S3) đã được chuẩn hóa Docker đa nền tảng và **hoàn toàn sẵn sàng để đưa lên server Ubuntu và public ra toàn thế giới!**

Tuy nhiên, để hệ thống vận hành trơn tru và bảo mật trên môi trường Internet thực tế, bạn cần lưu ý **2 ĐIỀU KIỆN TIÊN QUYẾT** dưới đây:

---

## ⚠️ 2 LƯU Ý SỐNG CÒN KHI PUBLIC RA INTERNET

### 1. BẮT BUỘC PHẢI CÓ HTTPS (CHỨNG CHỈ SSL)
* **Lý do:** Dự án của bạn có 2 tính năng đặc thù:
  1. 📷 **Quét mã QR bằng Camera trực tiếp (`getUserMedia`)**
  2. 📍 **Lấy vị trí GPS thực tế trên Bản đồ di sản (`navigator.geolocation`)**
* **Cơ chế bảo mật trình duyệt:** Google Chrome, Safari, Firefox trên điện thoại **chặn tuyệt đối quyền truy cập Camera và GPS** nếu trang web chạy giao thức `http://` không bảo mật khi ra ngoài Internet (trình duyệt chỉ cho phép trên `localhost` hoặc `https://`).
* **Giải pháp đơn giản nhất (Miễn phí 100%):**
  * Dùng **Cloudflare**: Trỏ tên miền về Cloudflare và bật **Đám mây màu cam (Proxied ☁️)**. Cloudflare sẽ tự động cấp chứng chỉ SSL HTTPS miễn phí cho trang web của bạn chỉ trong 2 phút mà bạn không cần phải cấu hình phức tạp trên server!

### 2. MỞ CỔNG TƯỜNG LỬA TRÊN NHÀ CUNG CẤP VPS (SECURITY GROUP)
* Nếu bạn thuê VPS tại AWS, DigitalOcean, Google Cloud, Linode, Vultr, Viettel, FPT,... bạn cần vào giao diện web của nhà cung cấp mở các cổng:
  * Port **`22`** (SSH để đăng nhập)
  * Port **`80`** (HTTP Web)
  * Port **`443`** (HTTPS Bảo mật)
  * Port **`3000`** (Cổng Web Frontend)

---

## 🚀 HƯỚNG DẪN 4 BƯỚC TRIỂN KHAI CHI TIẾT TRÊN UBUNTU

### BƯỚC 1: Đăng nhập vào Server Ubuntu qua SSH
Mở Terminal hoặc PowerShell trên máy tính của bạn:
```bash
ssh root@<IP_SERVER_CUA_BAN>
```

---

### BƯỚC 2: Tải Mã Nguồn Lên Server
Bạn có thể clone từ kho Git của bạn:
```bash
git clone https://github.com/<tai-khoan>/<ten-repo>.git
cd <ten-repo>
```

*(Hoặc dùng lệnh `scp` hoặc FileZilla / WinSCP để copy toàn bộ thư mục code lên server).*

---

### BƯỚC 3: Chạy Kịch Bản Tự Động Hóa 1 Lệnh Duy Nhất
Tôi đã tạo sẵn tệp tin [`deploy-ubuntu.sh`](file:///d:/RND/deploy-ubuntu.sh) trên hệ thống. Bạn chỉ cần cấp quyền và chạy:

```bash
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

**Kịch bản này sẽ tự động làm mọi việc cho bạn:**
1. Tự cài đặt Docker & Docker Compose bản mới nhất (nếu server chưa có).
2. Tự cấu hình tường lửa UFW (mở các port 22, 80, 443, 3000).
3. Tự tạo file `.env` cấu hình mật khẩu.
4. Tự tải Base Images, biên dịch Java 21, Vite React và khởi chạy cả 4 container ngầm (`-d`).

---

### BƯỚC 4: Kiểm Tra Trạng Thái Hoạt Động

Sau khi script chạy xong, bạn kiểm tra các container:
```bash
docker compose ps
```
Nếu màn hình hiện 4 container đều có trạng thái **`Up`** (hoặc `healthy`), hệ thống đã sẵn sàng 100%:
* `heritage_frontend` (Port 80, 3000)
* `heritage_backend` (Port 8080)
* `heritage_postgres` (Port 5432 - Healthy)
* `heritage_minio` (Port 9000, 9001)

---

## 🔒 BẢO MẬT TRƯỚC KHI PUBLIC CHÍNH THỨC
Trước khi gửi link cho 2000 người dùng truy cập, hãy chỉnh sửa mật khẩu trong tệp `.env`:
```bash
nano .env
```
* Đổi `POSTGRES_PASSWORD` thành mật khẩu phức tạp của bạn.
* Đổi `MINIO_ROOT_PASSWORD` thành mật khẩu phức tạp.
* Đổi `JWT_SECRET` thành chuỗi bí mật dài ngẫu nhiên.
* Sau khi sửa xong, nhấn `Ctrl + O` để Lưu, `Ctrl + X` để Thoát, rồi khởi động lại:
```bash
docker compose up -d
```

---

## 📋 CÁC LỆNH TIỆN ÍCH THƯỜNG DÙNG TRÊN SERVER

| Mục đích | Lệnh thực hiện |
| :--- | :--- |
| **Xem log trực tiếp của cả hệ thống** | `docker compose logs -f` |
| **Xem log riêng của Backend** | `docker compose logs -f backend` |
| **Xem log riêng của Frontend** | `docker compose logs -f frontend` |
| **Dừng hệ thống** | `docker compose down` |
| **Cập nhật code mới và khởi động lại** | `git pull && docker compose up -d --build` |
