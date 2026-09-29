@echo off
chcp 65001 >nul
title NỀN TẢNG DI SẢN VĂN HÓA & LÀNG NGHỀ (DOCKER DEPLOYMENT)
echo ===================================================================
echo   HỆ THỐNG SỐ HÓA DI SẢN VĂN HÓA - TRIỂN KHAI TOÀN BỘ VỚI DOCKER
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/4] Đang kiểm tra trạng thái Docker Daemon...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [THÔNG BÁO] Docker Desktop chưa khởi chạy. Đang tự động bật Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Đang chờ Docker khởi động hoàn tất (khoảng 15-30 giây)...
    :WAIT_DOCKER
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto WAIT_DOCKER
    echo Docker Desktop đã sẵn sàng!
)

echo.
echo [2/4] Kiểm tra tệp thực thi Backend và Frontend...
if not exist "be\target\*.jar" (
    echo Đang đóng gói Backend Spring Boot (JAR Java 21)...
    cd be && call mvn clean package -DskipTests -q && cd ..
)
if not exist "fe\dist" (
    echo Đang biên dịch Frontend React (Vite Dist)...
    cd fe && call npm run build && cd ..
)

echo.
echo [3/4] Đang Build Docker Images và Khởi động 4 Container:
echo - 🗄️ Database: PostgreSQL 16 + PostGIS
echo - 📦 Storage:  MinIO S3
echo - 🔌 Backend:  Spring Boot 3.3.4 (Java 21 JRE Alpine)
echo - 🌐 Frontend: React Vite + Nginx Alpine
echo.

docker compose up -d --build

if %errorlevel% neq 0 (
    echo [LỖI] Có lỗi trong quá trình khởi động Docker. Vui lòng kiểm tra lại log.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Triển khai thành công toàn bộ hệ sinh thái Di Sản Số!
echo ===================================================================
echo   🌐 Giao diện Người dùng (Frontend):  http://localhost:3000
echo   🌐 Cổng HTTP mặc định:              http://localhost
echo   🔌 Backend API (Spring Boot):       http://localhost:8080/api/v1
echo   🗄️ Database PostgreSQL (PostGIS):   localhost:5432 (DB: heritagedb)
echo   📦 MinIO Dashboard (Media Storage): http://localhost:9001
echo      - Tài khoản MinIO:               heritage_admin
echo      - Mật khẩu MinIO:                HeritageMinio@2026
echo ===================================================================
echo.
echo Bạn có thể chạy 'docker-logs.bat' để theo dõi log trực tiếp,
echo hoặc chạy 'docker-stop.bat' để dừng hệ thống.
echo.
pause
