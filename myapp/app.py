from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

class Sorter:
    def __init__(self, file_path=None):
        self.file_path = file_path
        self.data = None

    def read(self):
        if self.file_path:
            try:
                with open(self.file_path, "r") as f:
                    self.data = json.load(f)
                    if not isinstance(self.data, list):
                        raise ValueError("Формат файла не соответствует ожидаемому. Ожидается список.")
                return True
            except Exception as e:
                return {"error": f"Ошибка при чтении файла: {e}"}

    def sort(self, field, reverse=False):
        if self.data is None:
            self.read()

        if not self.data:
            return {"error": "Нет данных для сортировки."}

        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
        except KeyError:
            return {"error": f"Поле '{field}' не найдено в данных."}
        except TypeError as e:
            return {"error": f"Ошибка при сортировке: {e}"}

    def write(self):
        if self.file_path and self.data is not None:
            try:
                with open(self.file_path, "w") as f:
                    json.dump(self.data, f, indent=4)
            except IOError as e:
                return {"error": f"Ошибка при записи файла: {e}"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/sort", methods=["POST"])
def sort():
    data = request.json
    sort_field = data.get("sort_field")
    reverse_sort = data.get("reverse_sort") == "yes"
    json_data = data.get("json_data")

    sorter = Sorter()  # Создаем экземпляр Sorter без указания файла
    sorter.data = json_data  # Устанавливаем данные напрямую
    sort_result = sorter.sort(sort_field, reverse=reverse_sort)
    
    if isinstance(sort_result, dict) and "error" in sort_result:
        return jsonify({"status": "error", "message": sort_result["error"]})

    return jsonify({"status": "success", "sorted_data": sorter.data})

if __name__ == "__main__":
    app.run(debug=True)