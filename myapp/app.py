import os
from flask import *
import json

app = Flask(__name__)

class JsonDataSorter:
    def __init__(self, data):
        self.data = data

    def sort(self, field, reverse=False):
        if self.data is None:
            raise ValueError("Нет данных для сортировки.")

        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
        except KeyError:
            raise KeyError(f"Поле '{field}' не найдено в данных.")
        except TypeError as e:
            raise TypeError(f"Ошибка при сортировке: {e}")

    def get_sorted_data(self):
        return self.data

class JsonDataWriter:
    def __init__(self, data):
        self.data = data

    def write_to_file(self, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=4)

class SortingController:
    def __init__(self, sorter):
        self.sorter = sorter

    def sort_and_save(self, field, reverse, filename):
        self.sorter.sort(field, reverse)
        sorted_data = self.sorter.get_sorted_data()
        writer = JsonDataWriter(sorted_data)  # Инициализируем JsonDataWriter после сортировки
        writer.write_to_file(filename)
        return sorted_data

class FlaskApplication:
    def __init__(self, app):
        self.app = app
        self.register_routes()

    def register_routes(self):
        @self.app.route("/")
        def index():
            return render_template("index.html")

        @self.app.route("/sort", methods=["POST"])
        def sort():
            data = request.json
            sort_field = data.get("sort_field")
            reverse_sort = data.get("reverse_sort") == "yes"
            json_data = data.get("json_data")

            try:
                sorter = JsonDataSorter(json_data)
                controller = SortingController(sorter)

                sorted_filename = os.path.join(os.getcwd(), "sorted_data.json")
                sorted_data = controller.sort_and_save(sort_field, reverse_sort, sorted_filename)

                return jsonify({"status": "success", "sorted_file": sorted_filename, "sorted_data": sorted_data})
            except Exception as e:
                return jsonify({"status": "error", "message": str(e)})

if __name__ == "__main__":
    flask_app = FlaskApplication(app)
    app.run(debug=True)