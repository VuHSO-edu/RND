#!/usr/bin/env bash
# ===================================================================
# SCRIPT TỰ ĐỘNG TRIỂN KHAI NỀN TẢNG DI SẢN SỐ LÊN UBUNTU SERVER
# Hệ điều hành hỗ trợ: Ubuntu 22.04 LTS / 24.04 LTS
# ===================================================================

set -e

echo "==================================================================="
echo "  BẮT ĐẦU TRIỂN KHAI NỀN TẢNG DI SẢN VĂN HÓA & LÀNG NGHỀ (UBUNTU)  "
echo "==================================================================="

# 1. Kiểm tra và cài đặt Docker & Docker Compose nếu máy chủ chưa có
if ! command -v docker &> /dev/null; then
    echo "[1/4] Docker chưa được cài đặt. Đang tiến hành cài đặt Docker Engine chính hãng..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo "Đã cài đặt Docker thành công!"
else
    echo "[1/4] Docker đã có sẵn trên hệ thống."
fi

# 2. Khởi tạo tệp .env nếu chưa có
if [ ! -f .env ]; then
    echo "[2/4] Chưa tìm thấy file .env, đang sao chép từ .env.example..."
    cp .env.example .env
    echo "Đã tạo file .env. Bạn có thể chỉnh sửa mật khẩu bằng lệnh: nano .env"
else
    echo "[2/4] File .env đã sẵn sàng."
fi

# 3. Cấu hình tường lửa UFW (Mở cổng 22 SSH, 80 HTTP, 443 HTTPS, 3000 Web)
echo "[3/4] Kiểm tra cấu hình Tường lửa (UFW)..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp || true
    sudo ufw allow 80/tcp || true
    sudo ufw allow 443/tcp || true
    sudo ufw allow 3000/tcp || true
    echo "Tường lửa đã cho phép các cổng: 22 (SSH), 80/443 (Web/SSL), 3000 (Frontend)."
fi

# 4. Build Docker Images và Khởi chạy toàn bộ hệ thống
echo "[4/4] Đang Build Docker Images và Khởi động các Containers..."
docker compose up -d --build

echo ""
echo "==================================================================="
echo "  🎉 CHÚC MỪNG! HỆ THỐNG ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG LÊN SERVER! "
echo "==================================================================="
echo "  🌐 Giao diện Web Di Sản:      http://<IP_SERVER>:3000 hoặc http://<IP_SERVER>"
echo "  🔌 Backend API:              http://<IP_SERVER>:8080/api/v1"
echo "  📦 MinIO Dashboard:          http://<IP_SERVER>:9001 (heritage_admin)"
echo "==================================================================="
echo ""
echo "Để theo dõi log thời gian thực: docker compose logs -f"
echo "Để dừng hệ thống:              docker compose down"
echo ""
