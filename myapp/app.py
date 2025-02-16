from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

class Sorter:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = None

    def read(self):
        try:
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    raise ValueError("Формат файла не соответствует ожидаемому. Ожидается список.")
            return True
        except Exception as e:
            return {"error": f"Ошибка при чтении файла: {e}"}
