@echo off
chcp 65001 >nul
title DỪNG HỆ THỐNG DOCKER DI SẢN
echo ===================================================================
echo   ĐANG DỪNG VÀ GIẢI PHÓNG TOÀN BỘ CONTAINER DOCKER DI SẢN...
echo ===================================================================
echo.

cd /d "%~dp0"
docker compose down

echo.
echo Đã dừng toàn bộ dịch vụ an toàn. Dữ liệu PostgreSQL và MinIO vẫn được bảo toàn trong Docker Volumes.
echo.
pause
