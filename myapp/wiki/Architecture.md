# Архитектура

## Обзор

DataSort Pro построен на клиент-серверной архитектуре:

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│    Frontend     │ ◄──────────► │    Backend      │
│   (Browser)     │    JSON       │   (Flask)       │
└─────────────────┘               └─────────────────┘
```

## Структура проекта

```
myapp/
├── app.py                 # Flask backend
├── requirements.txt       # Зависимости Python
├── README.md             # Документация
├── test_data.json        # Тестовые данные
│
├── templates/
│   └── index.html        # HTML шаблон
│
├── static/
│   ├── Main.js           # Frontend логика
│   └── style.css         # Стили
│
├── wiki/                 # Документация Wiki
│   ├── Home.md
│   ├── Installation.md
│   ├── User-Guide.md
│   ├── API.md
│   ├── Algorithms.md
│   ├── Architecture.md
│   └── FAQ.md
│
└── *.drawio              # Диаграммы
```

## Backend (app.py)

### Компоненты

```
┌─────────────────────────────────────────┐
│              Flask App                   │
├─────────────────────────────────────────┤
│  Routes:                                │
│  • GET  /        → index()              │
│  • POST /sort    → sort()               │
│  • POST /convert → convert()            │
├─────────────────────────────────────────┤
│  Sorter Class:                          │
│  • 11 методов сортировки                │
│  • Ленивая загрузка scipy               │
├─────────────────────────────────────────┤
│  Dependencies:                          │
│  • Flask (веб-сервер)                   │
│  • NumPy (массивы)                      │
│  • SciPy (статистика)                   │
└─────────────────────────────────────────┘
```

### Класс Sorter

```python
class Sorter:
    data: List[Dict]           # Данные для сортировки
    
    # Базовые
    sort()                     # Стандартная
    natural_sort()             # Естественная
    stable_sort()              # Стабильная
    
    # По зависимостям
    sort_by_direct_dependency()      # A × B
    sort_by_inverse_dependency()     # -A × B
    sort_by_proportional_dependency() # A / B
    sort_by_weighted()               # w1×A + w2×B
    
    # Статистические
    sort_by_correlation()      # Корреляция Пирсона
    sort_by_percentile()       # Перцентили
    sort_by_zscore()           # Z-оценка
    sort_by_cluster()          # Кластеризация
```

## Frontend (Main.js)

### Модули

```
┌─────────────────────────────────────────┐
│              Main.js                     │
├─────────────────────────────────────────┤
│  State:                                 │
│  • originalData    — исходные данные    │
│  • resultData      — результат          │
│  • currentFormat   — формат файла       │
│  • fileHistory     — история            │
├─────────────────────────────────────────┤
│  Modules:                               │
│  • Drop Zone       — загрузка файлов    │
│  • Navigation      — переключение       │
│  • Parsing         — JSON/CSV/XML       │
│  • Sorting         — вызов API          │
│  • Converting      — конвертация        │
│  • History         — localStorage       │
│  • Recommendations — анализ данных      │
└─────────────────────────────────────────┘
```

### Поток данных

```
Файл → parseData() → originalData
                          ↓
                    populateFields()
                          ↓
                    showOriginalData()
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
        performSort()          performConvert()
              ↓                       ↓
         POST /sort            formatData()
              ↓                       ↓
         resultData ◄─────────────────┘
              ↓
        showResultData()
              ↓
        downloadFile()
```

## Хранение данных

### Клиент (localStorage)

```javascript
{
  "fileHistory": [
    {
      "id": 1234567890,
      "name": "data.json",
      "format": "json",
      "size": 1024,
      "records": 100,
      "date": "13.01.2026, 19:00:00"
    }
  ]
}
```

### Сервер

Данные не сохраняются на сервере — stateless архитектура.

## Безопасность

- Валидация входных данных
- Экранирование спецсимволов (XML, CSV)
- Защита от деления на ноль
- Обработка исключений

## Производительность

### Оптимизации

1. **Ленивая загрузка scipy** — ускоряет старт
2. **Превью больших файлов** — показывает 100 записей
3. **NumPy argsort** — быстрая сортировка массивов
4. **setTimeout для UI** — не блокирует интерфейс

### Ограничения

| Параметр | Значение |
|----------|----------|
| Превью записей | 100 |
| История файлов | 10 |
| Кластеров | 5 |