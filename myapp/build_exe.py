"""
Скрипт для сборки standalone exe версии DataSort Pro
"""
import PyInstaller.__main__
import os
import shutil
import time

# Очищаем старые сборки (с повторными попытками)
for folder in ['dist', 'build']:
    if os.path.exists(folder):
        for attempt in range(3):
            try:
                shutil.rmtree(folder)
                print(f"✅ Удалена папка {folder}")
                break
            except PermissionError:
                if attempt < 2:
                    print(f"⏳ Ожидание освобождения {folder}...")
                    time.sleep(2)
                else:
                    print(f"⚠️  Не удалось удалить {folder}, продолжаем...")

# Параметры сборки (минимальная версия без лишних зависимостей)
PyInstaller.__main__.run([
    'app.py',
    '--name=DataSortPro',
    '--onefile',
    '--console',  # Показываем консоль для отладки
    '--add-data=templates;templates',
    '--add-data=static;static',
    '--add-data=test_data.json;.',
    '--hidden-import=scipy.special._cdflib',
    '--hidden-import=scipy.cluster.hierarchy',
    '--hidden-import=scipy.stats',
    '--exclude-module=torch',
    '--exclude-module=pandas',
    '--exclude-module=matplotlib',
    '--exclude-module=PIL',
    '--exclude-module=IPython',
    '--exclude-module=jupyter',
    '--exclude-module=notebook',
    '--noconfirm',
])

print("\n✅ Сборка завершена! Exe файл находится в папке dist/")
print("📦 Запустите DataSortPro.exe для старта приложения")
