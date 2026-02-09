@echo off
chcp 65001 >nul
title DataSort Pro - Сборка EXE
cls

echo ╔════════════════════════════════════════╗
echo ║   DataSort Pro - Сборка EXE файла      ║
echo ╚════════════════════════════════════════╝
echo.

echo 📦 Проверка зависимостей...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не установлен!
    echo 📥 Скачайте с https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python найден
echo.

echo 📥 Установка зависимостей...
pip install -r requirements-build.txt
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

echo.
echo 🔨 Сборка EXE файла...
echo ⏳ Это может занять несколько минут...
echo.

python build_exe.py
if errorlevel 1 (
    echo ❌ Ошибка сборки
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════╗
echo ║          ✅ Сборка завершена!          ║
echo ╚════════════════════════════════════════╝
echo.
echo 📂 EXE файл: dist\DataSortPro.exe
echo.
echo 📝 Следующие шаги:
echo    1. Скопируйте DataSortPro.exe из папки dist
echo    2. Запустите START.bat или DataSortPro.exe
echo.
pause
