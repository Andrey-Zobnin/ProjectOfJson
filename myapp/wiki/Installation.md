# Установка

## Требования

- Python 3.10+
- pip (менеджер пакетов)

## Шаги установки

### 1. Клонирование репозитория

```bash
git clone https://github.com/Andrey-Zobnin/ProjectOfJson.git
cd ProjectOfJson/myapp
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

Или вручную:

```bash
pip install flask numpy scipy
```

### 3. Запуск приложения

```bash
python app.py
```

### 4. Открытие в браузере

Перейдите по адресу: http://127.0.0.1:5000

## Зависимости

| Пакет | Версия | Назначение |
|-------|--------|------------|
| Flask | 3.x | Веб-фреймворк |
| NumPy | 2.x | Работа с массивами |
| SciPy | 1.x | Статистика, кластеризация |

## Возможные проблемы

### pip не найден

```bash
python -m pip install flask numpy scipy
```

### Порт 5000 занят

Измените порт в `app.py`:

```python
app.run(debug=True, port=5001)
```

### Ошибка импорта scipy

```bash
pip install --upgrade scipy
```

## Продакшн

Для продакшн-окружения используйте WSGI-сервер:

```bash
pip install gunicorn
gunicorn -w 4 app:app
```