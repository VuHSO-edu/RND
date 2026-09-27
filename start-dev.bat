@echo off
title Khoi Dong He Thong Di San Van Hoa (Docker + BE + FE)
echo ========================================================
echo   1. DANG KHOI DONG DATABASE POSTGRESQL (DOCKER)
echo ========================================================

cd /d D:\RND
docker compose up -d

echo.
echo Database PostgreSQL da khoi dong tren port 5432!
echo.
echo ========================================================
echo   2. DANG KHOI DONG BACKEND (SPRING BOOT) VA FRONTEND (REACT)
echo ========================================================

start "Heritage Backend (Port 8080)" cmd /k "cd /d D:\RND\be && mvn spring-boot:run"
start "Heritage Frontend (Port 3000)" cmd /k "cd /d D:\RND\fe && npm run dev"

echo.
echo Da bat toan bo he thong thanh cong!
echo - Database:   PostgreSQL localhost:5432 (Database: heritagedb)
echo - Backend:    http://localhost:8080
echo - Frontend:   http://localhost:3000
echo.
pause
