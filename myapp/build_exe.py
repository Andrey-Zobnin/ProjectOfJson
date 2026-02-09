"""
Скрипт для сборки standalone exe версии DataSort Pro
"""
import PyInstaller.__main__
import os
import shutil

# Очищаем старые сборки
if os.path.exists('dist'):
    shutil.rmtree('dist')
if os.path.exists('build'):
    shutil.rmtree('build')

# Параметры сборки
PyInstaller.__main__.run([
    'app.py',
    '--name=DataSortPro',
    '--onefile',
    '--windowed',
    '--icon=NONE',
    '--add-data=templates;templates',
    '--add-data=static;static',
    '--add-data=test_data.json;.',
    '--hidden-import=scipy.special._cdflib',
    '--hidden-import=scipy.cluster.hierarchy',
    '--hidden-import=scipy.stats',
    '--collect-all=scipy',
    '--collect-all=numpy',
    '--noconfirm',
])

print("\n✅ Сборка завершена! Exe файл находится в папке dist/")
print("📦 Запустите DataSortPro.exe для старта приложения")
