from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

class Sorter:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = None
