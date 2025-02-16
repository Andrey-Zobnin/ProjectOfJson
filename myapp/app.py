import os
from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Загружаем данные из файла при старте приложения
class Sorter:
    def __init__(self):
        self.data = None

    def read_from_file(self, filename):
        """Читает данные из файла и устанавливает их в self.data."""
        with open(filename, "r") as f:
            self.data = json.load(f)

    def write_to_file(self, filename):
        """Сохраняет данные в файл."""
        with open(filename, "w") as f:
            json.dump(self.data, f, indent=4)

    def sort(self, field, reverse=False):
        if self.data is None:
            return {"error": "Нет данных для сортировки."}

        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
        except KeyError:
            return {"error": f"Поле '{field}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def set_data(self, json_data):
        self.data = json_data

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/sort", methods=["POST"])
def sort():
    data = request.json
    sort_field = data.get("sort_field")
    reverse_sort = data.get("reverse_sort") == "yes"
    json_data = data.get("json_data")

    sorter = Sorter()
    sorter.set_data(json_data)

    sort_result = sorter.sort(sort_field, reverse_sort)

    if isinstance(sort_result, dict) and "error" in sort_result:
        return jsonify({"status": "error", "message": sort_result["error"]})
    
    sorted_filename = os.path.join(os.getcwd(), "sorted_data.json")  
    sorter.write_to_file(sorted_filename)

    return jsonify({"status": "success", "sorted_file": sorted_filename, "sorted_data": sorter.data})

if __name__ == "__main__":
    app.run(debug=True)