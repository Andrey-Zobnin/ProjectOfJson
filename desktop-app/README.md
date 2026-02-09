# DataSort Pro - Desktop Application

Полноценное оффлайн Windows-приложение с GUI, упакованное в один .exe установщик.

## Архитектура

- **Framework**: Neutralinojs (минимальный размер ~3-5 MB)
- **WebView**: Использует встроенный Edge WebView2 в Windows
- **Интерфейс**: HTML/CSS/JS вшиты внутрь .exe
- **Работа**: Полностью автономная, без сетевых запросов
- **Установщик**: Inno Setup для создания setup.exe

## Структура проекта

```
desktop-app/
├── neutralino.config.json    # Конфигурация Neutralino
├── package.json              # NPM зависимости
├── resources/                # Интерфейс приложения (вшивается в .exe)
│   ├── index.html           # Главная страница
│   ├── css/
│   │   └── style.css        # Стили (скопируй из myapp/static/style.css)
│   ├── js/
│   │   ├── neutralino.js    # Neutralino API (автоматически)
│   │   └── app.js           # Логика приложения
│   └── icons/
│       └── icon.png         # Иконка приложения
├── scripts/
│   └── create-installer.js  # Скрипт создания установщика
├── dist/                    # Собранное приложение (создаётся автоматически)
└── installer/               # Готовый setup.exe (создаётся автоматически)
```

## Быстрый старт (от нуля до setup.exe)

### Шаг 1: Установка зависимостей

```bash
# Установите Node.js 18+ с https://nodejs.org/

# Установите Neutralino CLI глобально
npm install -g @neutralinojs/neu

# Установите зависимости проекта
cd desktop-app
npm install
```

### Шаг 2: Инициализация Neutralino

```bash
# Скачивает бинарники Neutralino
npm run init
```

Это создаст папку `.tmp` с бинарниками для Windows.

### Шаг 3: Копирование интерфейса

```bash
# Скопируй CSS из веб-версии
copy ..\myapp\static\style.css resources\css\style.css

# Или создай свой интерфейс в resources/
```

### Шаг 4: Тестирование в режиме разработки

```bash
npm run dev
```

Откроется окно приложения. Проверь что всё работает.

### Шаг 5: Сборка релиза

```bash
npm run build:win
```

Это создаст папку `dist/DataSortPro/` с готовым приложением.

### Шаг 6: Установка Inno Setup

1. Скачай с https://jrsoftware.org/isdl.php
2. Установи в `C:\Program Files (x86)\Inno Setup 6\`

### Шаг 7: Создание установщика

```bash
npm run create-installer
```

Готово! Установщик будет в `installer/DataSortPro_Setup_2.1.0.exe`

### Одна команда для всего

```bash
npm run package
```

Это выполнит сборку + создание установщика автоматически.

## Размеры файлов

- **Приложение**: ~5-8 MB (Neutralino + ресурсы)
- **Установщик**: ~3-5 MB (сжатый LZMA2)
- **После установки**: ~8-10 MB

## Как заменить интерфейс

### Вариант 1: Использовать существующий веб-интерфейс

```bash
# Скопируй файлы из myapp/
copy ..\myapp\templates\index.html resources\index.html
copy ..\myapp\static\style.css resources\css\style.css
copy ..\myapp\static\Main.js resources\js\app.js
```

Затем адаптируй `app.js` для использования Neutralino API вместо Flask.

### Вариант 2: Создать новый интерфейс

1. Редактируй `resources/index.html`
2. Добавь стили в `resources/css/style.css`
3. Добавь логику в `resources/js/app.js`

**Важно**: Все ресурсы должны быть в папке `resources/` - они вшиваются в .exe.

## Как изменить иконку

### Создание иконки

```bash
# Используй любой PNG (256x256 или больше)
# Конвертируй в ICO с помощью онлайн-сервиса или ImageMagick

# Сохрани как resources/icons/icon.png
```

### Применение иконки

Иконка автоматически применится при сборке. Она указана в `neutralino.config.json`:

```json
"icon": "/resources/icons/icon.png"
```

## Как изменить название приложения

### В neutralino.config.json

```json
{
  "modes": {
    "window": {
      "title": "Твоё Название"
    }
  },
  "globalVariables": {
    "APP_NAME": "Твоё Название"
  }
}
```

### В package.json

```json
{
  "name": "tvoe-nazvanie",
  "description": "Твоё описание"
}
```

### В scripts/create-installer.js

```javascript
const APP_NAME = 'Твоё Название';
const APP_VERSION = '1.0.0';
```

## Neutralino API (для работы с файлами)

### Открытие файла

```javascript
const path = await Neutralino.os.showOpenDialog('Выберите файл', {
    filters: [
        {name: 'Data files', extensions: ['json', 'csv', 'xml']}
    ]
});

const content = await Neutralino.filesystem.readFile(path[0]);
```

### Сохранение файла

```javascript
const path = await Neutralino.os.showSaveDialog('Сохранить как');

await Neutralino.filesystem.writeFile(path, content);
```

### Показ уведомления

```javascript
await Neutralino.os.showNotification('Заголовок', 'Сообщение');
```

### Получение информации о системе

```javascript
const info = await Neutralino.os.getEnv('OS');
console.log('ОС:', info);
```

## Отладка

### Включение DevTools

В `neutralino.config.json`:

```json
{
  "modes": {
    "window": {
      "enableInspector": true
    }
  }
}
```

Затем в приложении нажми `F12` для открытия DevTools.

### Логирование

```javascript
console.log('Отладочное сообщение');
// Логи видны в DevTools Console
```

## Установка приложения

1. Пользователь скачивает `DataSortPro_Setup_2.1.0.exe`
2. Запускает установщик
3. Выбирает папку установки (по умолчанию `C:\Program Files\DataSort Pro`)
4. Установщик создаёт:
   - Ярлык в меню Пуск
   - Ярлык на рабочем столе (опционально)
   - Запись в "Программы и компоненты"
5. Готово! Приложение запускается как обычная Windows программа

## Удаление

- Панель управления → Программы и компоненты → DataSort Pro → Удалить
- Или через меню Пуск → DataSort Pro → Удалить

## Обновление приложения

1. Измени версию в `package.json` и `scripts/create-installer.js`
2. Собери новый установщик: `npm run package`
3. Пользователи устанавливают новую версию поверх старой

## Преимущества Neutralinojs

✅ **Минимальный размер**: ~3-5 MB (vs Electron ~150 MB)
✅ **Быстрый запуск**: нативный WebView, без Node.js
✅ **Простая интеграция**: обычный HTML/CSS/JS
✅ **Кроссплатформенность**: Windows, Linux, macOS
✅ **Нативный API**: доступ к файловой системе, ОС, окнам

## Сравнение с альтернативами

| Фреймворк | Размер | Скорость | Сложность |
|-----------|--------|----------|-----------|
| Neutralino | ~5 MB | ⚡⚡⚡ | Простая |
| Tauri | ~10 MB | ⚡⚡ | Средняя |
| Electron | ~150 MB | ⚡ | Простая |
| .NET WinForms | ~50 MB | ⚡⚡⚡ | Сложная |

## Troubleshooting

### "neu: command not found"

```bash
npm install -g @neutralinojs/neu
```

### "Inno Setup не найден"

Установи Inno Setup с https://jrsoftware.org/isdl.php в стандартную папку.

### "Приложение не запускается"

1. Проверь что WebView2 установлен (встроен в Windows 10/11)
2. Запусти от имени администратора
3. Проверь антивирус

### "Файлы не загружаются"

Убедись что все ресурсы в папке `resources/` и пути относительные.

## Лицензия

MIT License - свободное использование и модификация.

## Поддержка

- GitHub: https://github.com/Andrey-Zobnin/ProjectOfJson
- Issues: https://github.com/Andrey-Zobnin/ProjectOfJson/issues
- Neutralino Docs: https://neutralino.js.org/docs/
