# API Документация

## Базовый URL

```
http://127.0.0.1:5000
```

## Endpoints

### GET /

Главная страница приложения.

**Ответ:** HTML страница

---

### POST /sort

Сортировка данных.

**Content-Type:** `application/json`

**Параметры запроса:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| json_data | array | ✅ | Массив объектов для сортировки |
| sort_field | string | ✅ | Поле для сортировки |
| reverse_sort | string | ❌ | "yes" для сортировки по убыванию |
| algorithm | string | ❌ | Тип алгоритма (по умолчанию "standard") |
| second_field | string | ❌ | Второе поле (для алгоритмов с зависимостями) |
| filter_field | string | ❌ | Поле для фильтрации |
| filter_value | string | ❌ | Значение фильтра |

**Алгоритмы:**

- `standard` — стандартная сортировка
- `natural` — естественная сортировка
- `stable` — стабильная сортировка
- `direct` — прямая зависимость (A × B)
- `inverse` — обратная зависимость (-A × B)
- `proportional` — пропорциональная (A / B)
- `correlation` — корреляция Пирсона
- `weighted` — взвешенная сортировка
- `percentile` — по перцентилям
- `zscore` — по Z-оценке
- `cluster` — кластерная сортировка

**Пример запроса:**

```json
{
  "json_data": [
    {"name": "Иван", "age": 25, "salary": 50000},
    {"name": "Мария", "age": 30, "salary": 70000}
  ],
  "sort_field": "salary",
  "reverse_sort": "yes",
  "algorithm": "standard"
}
```

**Успешный ответ:**

```json
{
  "status": "success",
  "sorted_data": [
    {"name": "Мария", "age": 30, "salary": 70000},
    {"name": "Иван", "age": 25, "salary": 50000}
  ]
}
```

**Ответ с ошибкой:**

```json
{
  "status": "error",
  "message": "Нет данных для сортировки"
}
```

---

### POST /convert

Конвертация данных в другой формат.

**Content-Type:** `application/json`

**Параметры запроса:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| json_data | array | ✅ | Массив объектов |
| target_format | string | ✅ | Целевой формат: "json", "csv", "xml" |

**Пример запроса:**

```json
{
  "json_data": [
    {"name": "Иван", "age": 25},
    {"name": "Мария", "age": 30}
  ],
  "target_format": "csv"
}
```

**Успешный ответ:**

```json
{
  "status": "success",
  "content": "name,age\nИван,25\nМария,30"
}
```

---

## Примеры использования

### Python

```python
import requests

data = {
    "json_data": [{"a": 3}, {"a": 1}, {"a": 2}],
    "sort_field": "a",
    "algorithm": "standard"
}

response = requests.post("http://127.0.0.1:5000/sort", json=data)
print(response.json())
```

### JavaScript

```javascript
const data = {
    json_data: [{a: 3}, {a: 1}, {a: 2}],
    sort_field: "a",
    algorithm: "standard"
};

fetch("/sort", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
})
.then(res => res.json())
.then(console.log);
```

### cURL

```bash
curl -X POST http://127.0.0.1:5000/sort \
  -H "Content-Type: application/json" \
  -d '{"json_data":[{"a":3},{"a":1}],"sort_field":"a"}'
```