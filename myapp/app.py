"""
DataSort Pro — Backend API
Универсальный сортировщик данных с поддержкой JSON, CSV, XML

Автор: DataSort Team
Версия: 1.0.0
"""

import os
import re
import json
from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

# =============================================================================
# Ленивая загрузка тяжёлых библиотек (ускоряет старт приложения)
# =============================================================================

_scipy_stats = None
_scipy_cluster = None


def get_scipy_stats():
    """Загружает scipy.stats только при первом использовании"""
    global _scipy_stats
    if _scipy_stats is None:
        from scipy.stats import pearsonr, zscore
        _scipy_stats = {'pearsonr': pearsonr, 'zscore': zscore}
    return _scipy_stats


def get_scipy_cluster():
    """Загружает scipy.cluster только при первом использовании"""
    global _scipy_cluster
    if _scipy_cluster is None:
        from scipy.cluster.hierarchy import linkage, fcluster
        _scipy_cluster = {'linkage': linkage, 'fcluster': fcluster}
    return _scipy_cluster


# =============================================================================
# Класс Sorter — основная логика сортировки
# =============================================================================

class Sorter:
    """
    Класс для сортировки данных различными алгоритмами.
    
    Поддерживает:
    - Стандартную сортировку
    - Естественную сортировку (для строк с числами)
    - Сортировку по зависимостям между полями
    - Статистические методы (корреляция, Z-оценка, перцентили)
    - Кластерную сортировку
    """
    
    def __init__(self):
        self.data = None

    def set_data(self, data):
        """Устанавливает данные для сортировки, фильтруя только словари"""
        self.data = [item for item in data if isinstance(item, dict)]

    def _get_numeric_value(self, item, key, default=0):
        """
        Безопасно извлекает числовое значение из словаря.
        
        Args:
            item: словарь с данными
            key: ключ для извлечения
            default: значение по умолчанию
            
        Returns:
            float: числовое значение или default
        """
        val = item.get(key, default)
        if isinstance(val, (int, float)):
            return val
        try:
            return float(val)
        except (ValueError, TypeError):
            return default

    # -------------------------------------------------------------------------
    # Базовые алгоритмы сортировки
    # -------------------------------------------------------------------------

    def sort(self, field=None, reverse=False, value=None):
        """
        Стандартная сортировка по одному полю.
        
        Args:
            field: поле для сортировки (если None — первое поле)
            reverse: True для сортировки по убыванию
            value: фильтр по значению (опционально)
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            # Фильтрация по значению
            if value:
                value_str = str(value)
                self.data = [item for item in self.data 
                            if str(item.get(field, '')) == value_str]
            
            # Если поле не указано — берём первое
            if field is None and self.data:
                field = list(self.data[0].keys())[0]
            
            self.data = sorted(self.data, 
                              key=lambda x: x.get(field, 0), 
                              reverse=reverse)
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def natural_sort(self, field, reverse=False):
        """
        Естественная сортировка для строк с числами.
        Пример: file1, file2, file10 (а не file1, file10, file2)
        
        Args:
            field: поле для сортировки
            reverse: True для сортировки по убыванию
        """
        def natural_key(item):
            val = str(item.get(field, ''))
            # Разбиваем строку на части: текст и числа
            return [int(c) if c.isdigit() else c.lower() 
                    for c in re.split(r'(\d+)', val)]
        
        self.data = sorted(self.data, key=natural_key, reverse=reverse)

    def stable_sort(self, field, reverse=False):
        """
        Стабильная сортировка — сохраняет порядок равных элементов.
        
        Args:
            field: поле для сортировки
            reverse: True для сортировки по убыванию
        """
        # Добавляем индекс для сохранения порядка
        indexed = list(enumerate(self.data))
        indexed.sort(key=lambda x: (x[1].get(field, 0), x[0]), reverse=reverse)
        self.data = [item[1] for item in indexed]

    # -------------------------------------------------------------------------
    # Сортировка по зависимостям между полями
    # -------------------------------------------------------------------------

    def sort_by_direct_dependency(self, key1, key2, reverse=False):
        """
        Прямая зависимость: сортировка по произведению A × B.
        Полезно для оценки совокупного влияния двух факторов.
        
        Args:
            key1: первое поле
            key2: второе поле
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            self.data = sorted(
                self.data, 
                key=lambda x: get_val(x, key1) * get_val(x, key2), 
                reverse=reverse
            )
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_inverse_dependency(self, key1, key2, reverse=False):
        """
        Обратная зависимость: сортировка по -A × B.
        Полезно когда нужно найти записи с низким A и высоким B.
        
        Args:
            key1: первое поле
            key2: второе поле
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            self.data = sorted(
                self.data, 
                key=lambda x: -get_val(x, key1) * get_val(x, key2), 
                reverse=reverse
            )
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_proportional_dependency(self, key1, key2, reverse=False):
        """
        Пропорциональная зависимость: сортировка по A / B.
        Полезно для расчёта эффективности (например, доход/затраты).
        
        Args:
            key1: числитель
            key2: знаменатель
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            # Добавляем малое число для избежания деления на ноль
            self.data = sorted(
                self.data, 
                key=lambda x: get_val(x, key1) / (get_val(x, key2) + 1e-10), 
                reverse=reverse
            )
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    # -------------------------------------------------------------------------
    # Статистические методы сортировки
    # -------------------------------------------------------------------------

    def sort_by_correlation(self, key1, key2, reverse=False):
        """
        Сортировка с учётом корреляции Пирсона между полями.
        Взвешивает второе поле коэффициентом корреляции.
        
        Args:
            key1: первое поле
            key2: второе поле
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            vals1 = [get_val(item, key1) for item in self.data]
            vals2 = [get_val(item, key2) for item in self.data]
            
            scipy_stats = get_scipy_stats()
            correlation, _ = scipy_stats['pearsonr'](vals1, vals2)
            
            # Сортируем по взвешенной сумме
            self.data = sorted(
                self.data, 
                key=lambda x: get_val(x, key1) + correlation * get_val(x, key2), 
                reverse=reverse
            )
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_weighted(self, key1, key2, reverse=False, weight1=0.6, weight2=0.4):
        """
        Взвешенная сортировка: w1×A + w2×B.
        Позволяет задать важность каждого поля.
        
        Args:
            key1: первое поле
            key2: второе поле
            reverse: True для сортировки по убыванию
            weight1: вес первого поля (по умолчанию 0.6)
            weight2: вес второго поля (по умолчанию 0.4)
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            self.data = sorted(
                self.data, 
                key=lambda x: weight1 * get_val(x, key1) + weight2 * get_val(x, key2), 
                reverse=reverse
            )
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_percentile(self, field, reverse=False):
        """
        Сортировка по перцентилям — показывает позицию в распределении.
        
        Args:
            field: поле для сортировки
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            values = np.array([get_val(item, field) for item in self.data])
            
            # Используем numpy argsort для скорости
            indices = np.argsort(values)
            if reverse:
                indices = indices[::-1]
            
            self.data = [self.data[i] for i in indices]
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_zscore(self, field, reverse=False):
        """
        Сортировка по Z-оценке (стандартное отклонение от среднего).
        Полезно для выявления аномальных значений.
        
        Args:
            field: поле для сортировки
            reverse: True для сортировки по убыванию
        """
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        
        try:
            get_val = self._get_numeric_value
            values = np.array([get_val(item, field) for item in self.data])
            
            scipy_stats = get_scipy_stats()
            z_scores = scipy_stats['zscore'](values)
            
            indices = np.argsort(z_scores)
            if reverse:
                indices = indices[::-1]
            
            self.data = [self.data[i] for i in indices]
        except Exception as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_cluster(self, key1, key2, reverse=False):
        """
        Кластерная сортировка — группирует похожие записи вместе.
        Использует иерархическую кластеризацию методом Уорда.
        
        Args:
            key1: первое поле для кластеризации
            key2: второе поле для кластеризации
            reverse: True для обратного порядка кластеров
        """
        if self.data is None or len(self.data) < 2:
            return {"error": "Недостаточно данных для кластеризации."}
        
        try:
            get_val = self._get_numeric_value
            
            # Формируем матрицу признаков
            features = np.array([
                [get_val(item, key1), get_val(item, key2)] 
                for item in self.data
            ])
            
            scipy_cluster = get_scipy_cluster()
            linkage_matrix = scipy_cluster['linkage'](features, method='ward')
            
            # Определяем количество кластеров (максимум 5)
            n_clusters = min(5, len(self.data))
            clusters = scipy_cluster['fcluster'](
                linkage_matrix, n_clusters, criterion='maxclust'
            )
            
            # Сортируем по кластеру, затем по первому полю
            indexed = list(enumerate(self.data))
            indexed.sort(
                key=lambda x: (clusters[x[0]], get_val(x[1], key1)), 
                reverse=reverse
            )
            self.data = [item[1] for item in indexed]
            
        except Exception as e:
            return {"error": f"Ошибка при кластеризации: {e}"}


# =============================================================================
# Flask Routes — API endpoints
# =============================================================================

@app.route("/")
def index():
    """Главная страница приложения"""
    return render_template("index.html")


@app.route("/sort", methods=["POST"])
def sort():
    """
    API endpoint для сортировки данных.
    
    Request JSON:
        - json_data: массив объектов для сортировки
        - sort_field: поле для сортировки
        - reverse_sort: "yes" для сортировки по убыванию
        - algorithm: тип алгоритма сортировки
        - second_field: второе поле (для алгоритмов с зависимостями)
        - filter_field: поле для фильтрации
        - filter_value: значение фильтра
    
    Response JSON:
        - status: "success" или "error"
        - sorted_data: отсортированный массив (при успехе)
        - message: сообщение об ошибке (при ошибке)
    """
    data = request.json
    
    # Извлекаем параметры
    json_data = data.get("json_data")
    sort_field = data.get("sort_field")
    sort_value = data.get("sort_value")
    reverse_sort = data.get("reverse_sort") == "yes"
    algorithm = data.get("algorithm", data.get("dependency_type", "standard"))
    second_field = data.get("second_field")
    filter_field = data.get("filter_field")
    filter_value = data.get("filter_value")

    if not json_data:
        return jsonify({"status": "error", "message": "Нет данных для сортировки"})

    # Создаём сортировщик и загружаем данные
    sorter = Sorter()
    sorter.set_data(json_data)

    # Применяем фильтрацию (если указана)
    if filter_field and filter_value:
        filter_value_lower = filter_value.lower()
        sorter.data = [
            item for item in sorter.data 
            if filter_value_lower in str(item.get(filter_field, '')).lower()
        ]

    # Выбираем и применяем алгоритм сортировки
    try:
        algorithm_map = {
            "natural": lambda: sorter.natural_sort(sort_field, reverse_sort),
            "stable": lambda: sorter.stable_sort(sort_field, reverse_sort),
            "direct": lambda: sorter.sort_by_direct_dependency(sort_field, second_field, reverse_sort),
            "inverse": lambda: sorter.sort_by_inverse_dependency(sort_field, second_field, reverse_sort),
            "proportional": lambda: sorter.sort_by_proportional_dependency(sort_field, second_field, reverse_sort),
            "correlation": lambda: sorter.sort_by_correlation(sort_field, second_field, reverse_sort),
            "weighted": lambda: sorter.sort_by_weighted(sort_field, second_field, reverse_sort),
            "percentile": lambda: sorter.sort_by_percentile(sort_field, reverse_sort),
            "zscore": lambda: sorter.sort_by_zscore(sort_field, reverse_sort),
            "cluster": lambda: sorter.sort_by_cluster(sort_field, second_field, reverse_sort),
        }
        
        if algorithm in algorithm_map:
            algorithm_map[algorithm]()
        else:
            sorter.sort(sort_field, reverse_sort, sort_value)
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

    return jsonify({"status": "success", "sorted_data": sorter.data})


@app.route("/convert", methods=["POST"])
def convert():
    """
    API endpoint для конвертации данных в другой формат.
    
    Request JSON:
        - json_data: массив объектов
        - target_format: целевой формат ("json", "csv", "xml")
    
    Response JSON:
        - status: "success" или "error"
        - content: сконвертированные данные в виде строки
    """
    data = request.json
    json_data = data.get("json_data")
    target_format = data.get("target_format")
    
    if not json_data:
        return jsonify({"status": "error", "message": "Нет данных"})
    
    try:
        if target_format == "csv":
            content = _convert_to_csv(json_data)
        elif target_format == "xml":
            content = _convert_to_xml(json_data)
        else:
            content = json.dumps(json_data, ensure_ascii=False, indent=2)
            
        return jsonify({"status": "success", "content": content})
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


def _convert_to_csv(data):
    """Конвертирует данные в CSV формат"""
    if not data:
        return ""
    
    headers = list(data[0].keys())
    lines = [','.join(headers)]
    
    for item in data:
        values = []
        for h in headers:
            val = item.get(h, '')
            if val is None:
                val = ''
            val = str(val)
            # Экранируем спецсимволы
            if ',' in val or '"' in val or '\n' in val:
                val = '"' + val.replace('"', '""') + '"'
            values.append(val)
        lines.append(','.join(values))
    
    return '\n'.join(lines)


def _convert_to_xml(data):
    """Конвертирует данные в XML формат"""
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<data>']
    
    for item in data:
        parts.append('  <item>')
        for key, value in item.items():
            # Экранируем спецсимволы XML
            safe_val = str(value or '')
            safe_val = safe_val.replace('&', '&amp;')
            safe_val = safe_val.replace('<', '&lt;')
            safe_val = safe_val.replace('>', '&gt;')
            parts.append(f'    <{key}>{safe_val}</{key}>')
        parts.append('  </item>')
    
    parts.append('</data>')
    return '\n'.join(parts)


# =============================================================================
# Запуск приложения
# =============================================================================

if __name__ == "__main__":
    app.run(debug=True)