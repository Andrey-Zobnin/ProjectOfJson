@echo off
chcp 65001 >nul
title DataSort Pro - Запуск
cls

echo ╔════════════════════════════════════════╗
echo ║      DataSort Pro - Запуск             ║
echo ╚════════════════════════════════════════╝
echo.

if exist "DataSortPro.exe" (
    echo ✅ Запуск приложения...
    echo.
    echo 🌐 Откройте браузер: http://127.0.0.1:5000
    echo.
    echo ⚠️  Не закрывайте это окно!
    echo.
    start "" "http://127.0.0.1:5000"
    DataSortPro.exe
) else (
    echo ❌ Файл DataSortPro.exe не найден!
    echo.
    echo 📝 Инструкция по сборке:
    echo    1. Установите Python 3.10+
    echo    2. pip install -r requirements-build.txt
    echo    3. python build_exe.py
    echo.
    pause
)
