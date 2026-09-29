# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG BẰNG DOCKER
**Dự án:** Nền tảng Di sản Văn hóa & Thương mại Điện tử Làng nghề Truyền thống  
**Kiến trúc:** Micro-services Containerized 4 Tầng (PostgreSQL PostGIS + MinIO S3 + Spring Boot 3 + Nginx React SPA)

---

## 1. TỔNG QUAN KIẾN TRÚC DOCKER

Toàn bộ hệ thống được container hóa khép kín thông qua mạng bridge nội bộ `heritage_net`:

```
[ Khách hàng / Nghệ nhân / Quản trị viên ]
                     │
                     ▼ (Port 3000 / Port 80)
┌────────────────────────────────────────────────────────┐
│  heritage_frontend (Nginx Alpine + React SPA)         │
│  - Phục vụ tệp tĩnh (HTML, CSS, JS, Fonts, Assets)     │
│  - Nén Gzip tốc độ cao                                 │
│  - Reverse Proxy: /api/*  ───►  heritage_backend:8080   │
└────────────────────────────┬───────────────────────────┘
                             │
                             ▼ (Port 8080)
┌────────────────────────────────────────────────────────┐
│  heritage_backend (Spring Boot 3.3.4, Java 21)         │
│  - RESTful APIs, Spring Security, JWT                  │
│  - Thuật toán chống hàng giả (NFC / QR / Geo-distance) │
│  - Quản lý Escrow, Hộ chiếu số, Merkle Tree Blockchain │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐  ┌───────────────────────┐
│ heritage_postgres (Port 5432)│  │ heritage_minio (9000) │
│ - PostgreSQL 16 + PostGIS    │  │ - MinIO Object S3     │
│ - Tọa độ không gian WGS84    │  │ - Video 4K, Ảnh 3D    │
│ - Persistent: postgres_data  │  │ - Console: Port 9001  │
└──────────────────────────────┘  └───────────────────────┘
```

---

## 2. DANH MỤC CỔNG VÀ ĐƯỜNG DẪN TRUY CẬP

| Dịch vụ | Container Name | Cổng Host | URL Truy Cập | Ghi chú |
| :--- | :--- | :---: | :--- | :--- |
| **Giao diện Web Di Sản (Frontend)** | `heritage_frontend` | **`3000`** / **`80`** | `http://localhost:3000` | Tự động proxy gọi API backend qua Nginx |
| **Backend REST API** | `heritage_backend` | **`8080`** | `http://localhost:8080/api/v1` | Spring Boot 3.3.4 (Java 21 JRE) |
| **Cơ sở dữ liệu Không gian (PostGIS)** | `heritage_postgres` | **`5432`** | `localhost:5432` | DB: `heritagedb`, User: `heritage_user` |
| **Media Object Storage (S3 API)** | `heritage_minio` | **`9000`** | `http://localhost:9000` | S3 compatible API |
| **MinIO Web Console** | `heritage_minio` | **`9001`** | `http://localhost:9001` | User: `heritage_admin` / Pass: `HeritageMinio@2026` |

---

## 3. CÁCH KHỞI ĐỘNG VÀ VẬN HÀNH

### Cách 1: Chạy 1-Click bằng Script tiện ích (Khuyên dùng trên Windows)
1. Nhấp đúp chuột vào tệp tin **[`docker-start.bat`](file:///d:/RND/docker-start.bat)**:
   * Script sẽ tự động kiểm tra xem Docker Desktop đã chạy chưa, nếu chưa sẽ tự bật Docker Desktop.
   * Tự động build lại image mới nhất và khởi động cả 4 container.
   * In ra toàn bộ thông số và đường link kết nối.
2. Để xem log thời gian thực: Nhấp đúp chuột vào **[`docker-logs.bat`](file:///d:/RND/docker-logs.bat)**.
3. Để dừng toàn bộ hệ thống: Nhấp đúp chuột vào **[`docker-stop.bat`](file:///d:/RND/docker-stop.bat)**.

### Cách 2: Sử dụng dòng lệnh Terminal / PowerShell
Tại thư mục gốc `D:\RND`:

```bash
# 1. Khởi động và build toàn bộ hệ sinh thái ở chế độ chạy ngầm
docker compose up -d --build

# 2. Kiểm tra trạng thái sức khỏe các container
docker compose ps

# 3. Theo dõi log dịch vụ
docker compose logs -f

# 4. Dừng hệ thống khi không sử dụng
docker compose down
```

---

## 4. BẢO TOÀN DỮ LIỆU & SAO LƯU (VOLUMES)
Dữ liệu được lưu trữ độc lập ngoài container thông qua Docker Volumes:
* `postgres_data`: Lưu trữ toàn bộ bảng dữ liệu PostgreSQL, dữ liệu không gian PostGIS, người dùng, hộ chiếu, đơn hàng. Dữ liệu **KHÔNG BỊ MẤT** khi restart container hay build lại image.
* `minio_data`: Lưu trữ toàn bộ file ảnh tác phẩm, video tư liệu ký sự của nghệ nhân, mô hình 3D AR.
