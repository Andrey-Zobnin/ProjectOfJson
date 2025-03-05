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

class Converter:
    def json_to_csv(self, json_data):
        csv_content = []
        headers = json_data[0].keys()
        csv_content.append(','.join(headers))

        for item in json_data:
            row = [str(item[header]) for header in headers]
            csv_content.append(','.join(row))

        return '\n'.join(csv_content)

    def csv_to_json(self, csv_content):
        json_data = []
        rows = csv_content.split('\n')
        headers = rows[0].split(',')

        for row in rows[1:]:
            if row.strip() == "":
                continue
            values = row.split(',')
            json_data.append(dict(zip(headers, values)))

        return json_data

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

    sorter = Sorter()
    sorter.set_data(json_data)

    # Если указано значение для сортировки, фильтруем данные
    if sort_value:
        sorter.data = [item for item in sorter.data if str(item.get(sort_field)) == str(sort_value)]

    sort_result = sorter.sort(sort_field, reverse_sort)

    if isinstance(sort_result, dict) and "error" in sort_result:
        return jsonify({"status": "error", "message": sort_result["error"]})
    
    return jsonify({"status": "success", "sorted_data": sorter.data})

@app.route("/convert", methods=["POST"])
def convert():
    data = request.json
    conversion_type = data.get("conversion_type")
    content = data.get("content")

    converter = Converter()

    if conversion_type == "json_to_csv":
        csv_content = converter.json_to_csv(json.loads(content))
        return jsonify({"status": "success", "converted_content": csv_content})
    elif conversion_type == "csv_to_json":
        json_data = converter.csv_to_json(content)
        return jsonify({"status": "success", "converted_content": json.dumps(json_data, ensure_ascii=False, indent=4)})
    else:
        return jsonify({"status": "error", "message": "Неподдерживаемый тип конвертации."})

if __name__ == "__main__":
    app.run(debug=True)