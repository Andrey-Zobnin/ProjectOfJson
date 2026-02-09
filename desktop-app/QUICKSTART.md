# Быстрый старт - DataSort Pro Desktop

## От нуля до setup.exe за 5 минут

### 1. Установите Node.js
Скачайте с https://nodejs.org/ (версия 18+)

### 2. Установите Neutralino CLI
```bash
npm install -g @neutralinojs/neu
```

### 3. Установите Inno Setup
Скачайте с https://jrsoftware.org/isdl.php

### 4. Запустите автоматическую сборку
```bash
cd desktop-app
BUILD_DESKTOP.bat
```

**Готово!** Установщик будет в `installer/DataSortPro_Setup_2.1.0.exe`

## Или вручную:

```bash
# Установка зависимостей
npm install

# Инициализация Neutralino
npm run init

# Тестирование
npm run dev

# Сборка + установщик
npm run package
```

## Структура файлов

```
desktop-app/
├── resources/          ← Твой интерфейс (HTML/CSS/JS)
│   ├── index.html     ← Главная страница
│   ├── css/
│   │   └── style.css  ← Стили
│   └── js/
│       └── app.js     ← Логика
├── dist/              ← Собранное приложение
└── installer/         ← Готовый setup.exe
```

## Замена интерфейса

1. Редактируй файлы в `resources/`
2. Запусти `npm run dev` для тестирования
3. Запусти `npm run package` для сборки

## Изменение названия

В `neutralino.config.json`:
```json
{
  "modes": {
    "window": {
      "title": "Твоё Название"
    }
  }
}
```

В `scripts/create-installer.js`:
```javascript
const APP_NAME = 'Твоё Название';
```

## Размеры

- Приложение: ~5-8 MB
- Установщик: ~3-5 MB (сжатый)
- После установки: ~8-10 MB

## Что получает пользователь

1. Скачивает `DataSortPro_Setup_2.1.0.exe` (3-5 MB)
2. Запускает установщик
3. Приложение устанавливается в `C:\Program Files\DataSort Pro`
4. Ярлык появляется в меню Пуск и на рабочем столе
5. Запускается как обычная Windows программа
6. Работает полностью оффлайн

## Troubleshooting

**"neu: command not found"**
```bash
npm install -g @neutralinojs/neu
```

**"Inno Setup не найден"**
Установи в стандартную папку: `C:\Program Files (x86)\Inno Setup 6\`

**"Приложение не запускается"**
- Проверь что WebView2 установлен (встроен в Windows 10/11)
- Запусти от имени администратора

## Полная документация

См. [README.md](README.md) для подробной информации.
