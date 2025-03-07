import os
from flask import Flask, render_template, request, jsonify
import json
import numpy as np
from scipy.stats import pearsonr

app = Flask(__name__)

class Sorter:
    def __init__(self):
        self.data = None

    def set_data(self, data):
        self.data = data

    def sort(self, field=None, reverse=False, value=None):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            if value:
                self.data = [item for item in self.data if item.get(field) == value]
            if field is None and self.data:
                field = list(self.data[0].keys())[0]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
        except KeyError:
            return {"error": f"Поле '{field}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_direct_dependency(self, key1, key2):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        try:
            self.data = sorted(self.data, key=lambda x: x.get(key1) * x.get(key2), reverse=False)
        except KeyError:
            return {"error": f"Поле '{key1}' или '{key2}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_inverse_dependency(self, key1, key2):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        try:
            self.data = sorted(self.data, key=lambda x: -x.get(key1) * x.get(key2), reverse=False)
        except KeyError:
            return {"error": f"Поле '{key1}' или '{key2}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_proportional_dependency(self, key1, key2):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        try:
            self.data = sorted(self.data, key=lambda x: x.get(key1) / (x.get(key2) + 1e-10), reverse=False)
        except KeyError:
            return {"error": f"Поле '{key1}' или '{key2}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def sort_by_correlation(self, key1, key2):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}
        try:
            correlation, _ = pearsonr(
                [item[key1] for item in self.data if key1 in item],
                [item[key2] for item in self.data if key2 in item]
            )
            self.data = sorted(self.data, key=lambda x: correlation, reverse=False)
        except KeyError:
            return {"error": f"Поле '{key1}' или '{key2}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/sort", methods=["POST"])
def sort():
    data = request.json
    json_data = data.get("json_data")
    sort_field = data.get("sort_field")
    sort_value = data.get("sort_value")
    reverse_sort = data.get("reverse_sort") == "yes"
    dependency_type = data.get("dependency_type")
    second_field = data.get("second_field")

    sorter = Sorter()
    sorter.set_data(json_data)

    if sort_value:
        sorter.data = [item for item in sorter.data if str(item.get(sort_field)) == str(sort_value)]

    if dependency_type == "direct":
        sorter.sort_by_direct_dependency(sort_field, second_field)
    elif dependency_type == "inverse":
        sorter.sort_by_inverse_dependency(sort_field, second_field)
    elif dependency_type == "proportional":
        sorter.sort_by_proportional_dependency(sort_field, second_field)
    elif dependency_type == "correlation":
        sorter.sort_by_correlation(sort_field, second_field)
    else:
        sorter.sort(sort_field, reverse_sort)

    sort_result = sorter.data

    return jsonify({"status": "success", "sorted_data": sort_result})

if __name__ == "__main__":
    app.run(debug=True)