import os
from flask import Flask, render_template, request, jsonify
import json

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
                self.data = [item for item in self.data if item.get(field) == value]  # Фильтрация по значению
            if field is None and self.data:
                field = list(self.data[0].keys())[0]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
        except KeyError:
            return {"error": f"Поле '{field}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def write_to_file(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=4)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/sort", methods=["POST"])
def sort():
    data = request.json
    json_data = data.get("json_data")
    sort_field = data.get("sort_field")
    sort_value = data.get("sort_value")  # Получаем значение для сортировки
    reverse_sort = data.get("reverse_sort") == "yes"

    sorter = Sorter()
    sorter.set_data(json_data)

    # Если указано значение для сортировки, фильтруем данные
    if sort_value:
        sorter.data = [item for item in sorter.data if str(item.get(sort_field)) == str(sort_value)]

    sort_result = sorter.sort(sort_field, reverse_sort)

    if isinstance(sort_result, dict) and "error" in sort_result:
        return jsonify({"status": "error", "message": sort_result["error"]})
    
    return jsonify({"status": "success", "sorted_data": sorter.data})

if __name__ == "__main__":
    app.run(debug=True)