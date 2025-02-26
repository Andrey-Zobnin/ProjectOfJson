import os
from flask import Flask, render_template, request, jsonify
import json

class DataInit:
    def __init__(self):
        self.__data = None

    def set_data(self, data):
        self.__data = data

    def get_data(self):
        return self.__data

class Sorter(DataInit):
    def __init__(self):
        super().__init__()

    def sort(self, field=None, reverse=False, value=None):
        if self.get_data() is None:
            return {"error": "Нет данных для сортировки."}
        try:
            data = [item for item in self.get_data() if isinstance(item, dict)]
            if value:
                data = [item for item in data if item.get(field) == value]
            if field is None and data:
                field = list(data[0].keys())[0]
            sorted_data = sorted(data, key=lambda x: x.get(field), reverse=reverse)
            self.set_data(sorted_data)
        except KeyError:
            return {"error": f"Поле '{field}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def write_to_file(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.get_data(), f, ensure_ascii=False, indent=4)

class App:
    def __init__(self):
        self.flask_app = Flask(__name__)
        self.sorter = Sorter()
        self.setup_routes()

    def setup_routes(self):
        @self.flask_app.route("/")
        def index():
            return render_template("index.html")

        @self.flask_app.route("/sort", methods=["POST"])
        def sort():
            data = request.json
            json_data = data.get("json_data")
            sort_field = data.get("sort_field")
            sort_value = data.get("sort_value")
            reverse_sort = data.get("reverse_sort") == "yes"

            self.sorter.set_data(json_data)

            if sort_value:
                self.sorter.set_data([item for item in self.sorter.get_data() if str(item.get(sort_field)) == str(sort_value)])

            sort_result = self.sorter.sort(sort_field, reverse_sort)

            if isinstance(sort_result, dict) and "error" in sort_result:
                return jsonify({"status": "error", "message": sort_result["error"]})

            return jsonify({"status": "success", "sorted_data": self.sorter.get_data()})

    def run(self):
        self.flask_app.run(debug=True)

if __name__ == "__main__":
    app = App()
    app.run()