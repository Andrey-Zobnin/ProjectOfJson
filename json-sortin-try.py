import json
import os
import sys


class Sorter:
    # инициализируем файлы
    def __init__(self, file_path):
        try:
            self.file_path = file_path
            self.data = None
        except ImportError as init_error:
            print(f"Error: Init failed: {init_error} ")

    def read_data(self):
        try:
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    self.data = []
        except FileNotFoundError:
            print(f"Error: File not found: {self.file_path}")
            self.data = []
        except json.JSONDecodeError as data_error:
            print(f"Error: Invalid JSON file: {data_error}")
            self.data = []

    def sort_data(self, field, reverse=False):
        if self.data is None:
            self.read_data()
        if self.data:
            try:
                # проверяем на то есть ли в файле указанные данные и сортируем их
                self.data = [item for item in self.data if isinstance(item, dict)]
                self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
            except KeyError as key_error:
                print(f"Нет данных для сортировки по ключевому слову")
                print(f"Error: Invalid sort field: {key_error}")
        else:
            print("Нет данных для сортировки")
            print("Error: No data to sort")

    def write_data_json(self):
        try:
            # open data to rewrite
            with open(self.file_path, "w") as file_data:
                json.dump(self.data, file_data)
        except IOError as write_error:
            print()
            print(f"Error: Error writing to file: {write_error}")


def main():
    file_path = input("Введите путь к JSON-файлу для сортировки: ")
    sort_field = input("Введите поле для сортировки: ")
    reverse_sort_input = input("Хотите выполнить сортировку по убыванию? (Введите 'yes' или 'no'): ")
    reverse_sort = reverse_sort_input.lower() == "yes"
    fordevelopers(file_path, sort_field, reverse_sort_input)
    run(file_path, sort_field, reverse_sort)
    stop_code()


def run(file_path, sort_field, reverse_sort):
    sorter = Sorter(file_path)
    sorter.read_data()
    sorter.sort_data(sort_field, reverse=reverse_sort)
    sorter.write_data_json()


#  to do
# add a and b function
def fordevelopers(file_path, sort_field, reverse_sort_input):
    keywords = ['a', 'b', 'restart_code']
    if file_path == keywords[2]:
        restart_code()
    elif sort_field == keywords[2]:
        restart_code()
    elif reverse_sort_input == keywords[2]:
        restart_code()


def restart_code():
    print("Программа будет перезапущена")
    print("Restarting main function...")
    main()


def stop_code():
    print("Программа будет остановлена")
    os._exit(0)  # остановка программы
    print("Эта строка не будет выполнена")


if __name__ == "__main__":
    main()

