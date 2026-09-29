# HƯỚNG DẪN ĐƯA DỰ ÁN LÊN TÊN MIỀN DISAN360.CLOUD
**Tên miền chính thức:** `https://disan360.cloud`  
**Hệ điều hành Server:** Ubuntu 22.04 LTS / 24.04 LTS  

---

## 🧭 LỘ TRÌNH 4 BƯỚC ĐƯA DISAN360.CLOUD PUBLIC RA INTERNET

```
[ Khách hàng / Nghệ nhân ]
           │
           ▼ (HTTPS Bảo mật)
  https://disan360.cloud
           │
     (Cloudflare SSL / DNS)
           │
           ▼ (Port 80 / 443)
┌────────────────────────────────────────────────────────┐
│  Server Ubuntu (IP Public của bạn)                     │
│  - Docker Container: heritage_frontend (Nginx)         │
│  - Docker Container: heritage_backend (Spring Boot 3)  │
│  - Docker Container: heritage_postgres (PostGIS 16)    │
│  - Docker Container: heritage_minio (Media S3)         │
└────────────────────────────────────────────────────────┘
```

---

### BƯỚC 1: TRỎ BẢN GHI DNS CỦA TÊN MIỀN DISAN360.CLOUD

Đăng nhập vào trang quản trị nơi bạn đã mua tên miền `disan360.cloud` (như Namecheap, Cloudflare, Hostinger, Mắt Bão, PA Việt Nam, GoDaddy,...), vào mục **Quản lý DNS (DNS Management)** và thêm 2 bản ghi sau:

| Loại (Type) | Tên (Host / Name) | Giá trị (Value / Points to) | TTL | Giải thích |
| :---: | :---: | :---: | :---: | :--- |
| **`A`** | **`@`** (hoặc để trống) | **`<IP_PUBLIC_SERVER_UBUNTU>`** | Auto / 300 | Trỏ `disan360.cloud` về server |
| **`CNAME`** | **`www`** | **`disan360.cloud`** | Auto / 300 | Trỏ `www.disan360.cloud` về tên miền chính |

*(Thay `<IP_PUBLIC_SERVER_UBUNTU>` bằng địa chỉ IP thật của VPS Ubuntu của bạn, ví dụ: `103.123.45.67`).*

---

### BƯỚC 2: BẬT HTTPS (SSL) MIỄN PHÍ QUA CLOUDFLARE (KHUYÊN DÙNG NHẤT)

> ⚠️ **BẮT BUỘC:** Tính năng **Quét QR bằng Camera** và **Bản đồ định vị GPS** của dự án yêu cầu bắt buộc phải có HTTPS. Trình duyệt di động (Chrome, Safari) sẽ khóa Camera nếu không có HTTPS!

1. Đăng ký tài khoản miễn phí tại [cloudflare.com](https://dash.cloudflare.com).
2. Chọn **"Add a domain"** ➡️ Nhập: `disan360.cloud` ➡️ Chọn gói **Free ($0)**.
3. Thay đổi 2 Nameserver ở nhà đăng ký tên miền theo hướng dẫn của Cloudflare.
4. Trong bảng điều khiển Cloudflare của `disan360.cloud`:
   * Vào mục **DNS Records**: Đảm bảo 2 bản ghi `A` và `CNAME` đều bật **Đám mây màu cam (Proxied ☁️)**.
   * Vào mục **SSL/TLS**: Chọn chế độ **`Flexible`** (hoặc `Full`).
5. 🎉 **XONG!** Cloudflare tự động kích hoạt HTTPS xanh `https://disan360.cloud`, chống tấn công DDoS và tăng tốc CDN cho 2000 người dùng đồng thời mà bạn không cần phải cài bất kỳ chứng chỉ nào trên server!

---

### BƯỚC 3: MỞ CỔNG TƯỜNG LỬA TRÊN VPS UBUNTU

Trên bảng điều khiển nhà cung cấp VPS (AWS, DigitalOcean, Vultr, Viettel IDC, FPT Cloud,...), vào mục **Security Groups / Firewall Rules** mở các cổng:
* Port **`22`** (SSH để quản trị)
* Port **`80`** (HTTP Web)
* Port **`443`** (HTTPS Bảo mật)

---

### BƯỚC 4: TRIỂN KHAI TRÊN SERVER UBUNTU

1. **SSH vào server:**
   ```bash
   ssh root@<IP_SERVER_UBUNTU>
   ```

2. **Tải mã nguồn về server:**
   ```bash
   git clone <URL_REPO_CUA_BAN>
   cd RND
   ```

3. **Cấu hình biến môi trường cho tên miền:**
   ```bash
   cp .env.example .env
   ```
   *(File `.env` đã được cấu hình sẵn `disan360.cloud` và `https://disan360.cloud/media`).*

4. **Khởi chạy hệ thống tự động:**
   ```bash
   chmod +x deploy-ubuntu.sh
   ./deploy-ubuntu.sh
   ```

5. **Kiểm tra trạng thái:**
   ```bash
   docker compose ps
   ```
   Khi thấy cả 4 container `heritage_frontend`, `heritage_backend`, `heritage_postgres`, `heritage_minio` đều ở trạng thái **`Up`**, bạn đã triển khai thành công!

---

## 📱 TRUY CẬP VÀ KIỂM THỬ TRÊN THIẾT BỊ DI ĐỘNG

Mở trình duyệt trên điện thoại hoặc máy tính truy cập:
👉 **`https://disan360.cloud`**

Kiểm tra ngay các tính năng di sản:
* 📷 **Bấm nút "Quét QR":** Cấp quyền Camera và quét thử tem QR sản phẩm.
* 🏷️ **Bấm nút "Xuất QR":** Tải tem decal bảo chứng di sản số PNG/SVG.
* 🗺️ **Bản đồ Di sản:** Định vị vị trí GPS và chọn tọa độ làng nghề tương tác.
