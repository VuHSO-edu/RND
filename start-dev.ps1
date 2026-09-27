# Script khoi dong he thong Di San Van Hoa (Docker + Backend + Frontend)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  1. DANG KHOI DONG DATABASE POSTGRESQL (DOCKER)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location "D:\RND"
docker compose up -d

Write-Host "`nDatabase PostgreSQL da khoi dong tren port 5432!" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  2. DANG KHOI DONG BACKEND (SPRING BOOT) VA FRONTEND (REACT)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\RND\be'; Write-Host '--- CHAY BACKEND (Port 8080) ---' -ForegroundColor Green; mvn spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\RND\fe'; Write-Host '--- CHAY FRONTEND (Port 3000) ---' -ForegroundColor Green; npm run dev"

Write-Host "`nDa mo toan bo he thong thanh cong!" -ForegroundColor Green
Write-Host "- Database:   PostgreSQL localhost:5432 (heritagedb)" -ForegroundColor Cyan
Write-Host "- Backend:    http://localhost:8080" -ForegroundColor Cyan
Write-Host "- Frontend:   http://localhost:3000" -ForegroundColor Cyan
