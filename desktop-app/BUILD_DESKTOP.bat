@echo off
chcp 65001 >nul
title DataSort Pro - Сборка Desktop приложения
cls

echo ╔════════════════════════════════════════╗
echo ║  DataSort Pro - Desktop App Builder    ║
echo ╚════════════════════════════════════════╝
echo.

echo 📦 Шаг 1: Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не установлен!
    echo 📥 Скачайте с https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js найден
echo.

echo 📦 Шаг 2: Установка зависимостей...
call npm install
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo.

echo 📦 Шаг 3: Инициализация Neutralino...
call npm run init
if errorlevel 1 (
    echo ❌ Ошибка инициализации
    pause
    exit /b 1
)
echo.

echo 📦 Шаг 4: Копирование ресурсов...
if not exist "resources\css" mkdir resources\css
if not exist "resources\js" mkdir resources\js
if not exist "resources\icons" mkdir resources\icons

if exist "..\myapp\static\style.css" (
    copy /Y "..\myapp\static\style.css" "resources\css\style.css" >nul
    echo ✅ CSS скопирован
) else (
    echo ⚠️  style.css не найден, используется базовый
)
echo.

echo 📦 Шаг 5: Сборка приложения...
call npm run build:win
if errorlevel 1 (
    echo ❌ Ошибка сборки
    pause
    exit /b 1
)
echo.

echo 📦 Шаг 6: Создание установщика...
call npm run create-installer
if errorlevel 1 (
    echo ❌ Ошибка создания установщика
    echo.
    echo 💡 Убедитесь что Inno Setup установлен:
    echo    https://jrsoftware.org/isdl.php
    pause
    exit /b 1
)
echo.

echo ╔════════════════════════════════════════╗
echo ║         ✅ Сборка завершена!           ║
echo ╚════════════════════════════════════════╝
echo.
echo 📂 Приложение: dist\DataSortPro\DataSortPro.exe
echo 📦 Установщик: installer\DataSortPro_Setup_2.1.0.exe
echo.
echo 📝 Следующие шаги:
echo    1. Протестируйте приложение
echo    2. Протестируйте установщик
echo    3. Загрузите в GitHub Release
echo.
pause
