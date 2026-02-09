@echo off
chcp 65001 >nul
title DataSort Pro - Сборка установщика
cls

echo ╔════════════════════════════════════════╗
echo ║   DataSort Pro - Сборка установщика    ║
echo ╚════════════════════════════════════════╝
echo.

echo 📦 Шаг 1: Сборка EXE файла...
echo.

if not exist "dist\DataSortPro.exe" (
    echo ⚠️  EXE файл не найден. Запускаем сборку...
    call BUILD.bat
    if errorlevel 1 (
        echo ❌ Ошибка сборки EXE
        pause
        exit /b 1
    )
) else (
    echo ✅ EXE файл уже существует
)

echo.
echo 📦 Шаг 2: Проверка Inno Setup...
echo.

set INNO_PATH="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %INNO_PATH% (
    echo ❌ Inno Setup не найден!
    echo.
    echo 📥 Скачайте и установите Inno Setup:
    echo    https://jrsoftware.org/isdl.php
    echo.
    echo После установки запустите этот скрипт снова.
    pause
    exit /b 1
)

echo ✅ Inno Setup найден
echo.
echo 📦 Шаг 3: Создание установщика...
echo.

%INNO_PATH% installer.iss
if errorlevel 1 (
    echo ❌ Ошибка создания установщика
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════╗
echo ║      ✅ Установщик создан!             ║
echo ╚════════════════════════════════════════╝
echo.
echo 📂 Файл: installer_output\DataSortPro_Setup_2.1.0.exe
echo.
echo 📝 Следующие шаги:
echo    1. Протестируйте установщик
echo    2. Загрузите его в GitHub Release
echo    3. Пользователи смогут скачать и установить
echo.
pause
