@echo off
chcp 65001 >nul
title THEO DÕI LOG HỆ THỐNG DOCKER DI SẢN
echo ===================================================================
echo   THEO DÕI LOG THỜI GIAN THỰC CỦA TOÀN BỘ SERVICES (Nhấn Ctrl+C để thoát)
echo ===================================================================
echo.

cd /d "%~dp0"
docker compose logs -f
