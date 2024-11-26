import json
import logging


# to do исправить 3 проблемы с протоколированием:
"""
Проблемы с протоколированием:

Код не регистрирует ошибки, если файл JSON недействителен или отсутствует.
Код не регистрирует ошибки, если поле сортировки недействительно.
Код не регистрирует ошибки, если файл JSON содержит элементы, не относящиеся к словарю.

Рекомендации по обработке ошибок:

Перехватывать FileNotFoundError и регистрировать сообщение об ошибке, когда файл JSON не найден.
Перехватывать ValueError и регистрировать сообщение об ошибке, когда файл JSON недействителен.
Перехватывать KeyError и регистрировать сообщение об ошибке, когда поле сортировки недействительно.
Подумайте о том, чтобы добавить блок try-except к вызову json.load(),
чтобы отлавливать любые ошибки синтаксического анализа JSON.
"""

class Sorter:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = None

    def read_data(self):
        try:
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    raise ValueError("Формат файла не соответствует ожидаемому")
        except FileNotFoundError:
            logging.error("Файл не найден")
        except ValueError as e:
            logging.error("Ошибка при чтении файла: %s", e)

    def sort(self, field, reverse=False):
        if self.data is None:
            self.read_data()
        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            self.data = sorted(self.data, key=lambda x: x[field], reverse=reverse)
        except KeyError:
            logging.error("Данное поле не найдено...", field)

    def write(self):
        try:
            with open(self.file_path, "w") as f:
                json.dump(self.data, f)
        except IOError as e:
            logging.error("Возникла ошибка при записи файла: ", e)


def main():
    file_path = input("Введите путь к JSON-файлу для сортировки: ")
    if not file_path:
        logging.error("Путь к файлу не указан")
        return

    sort_field = input("Введите поле для сортировки: ")
    if not sort_field:
        logging.error("Поле для сортировки не указано")
        return

    reverse_sort_input = input("Хотите выполнить сортировку по убыванию? (Введите 'yes' или 'no'): ")
    reverse_sort = reverse_sort_input.lower() == "yes"

    sorter = Sorter(file_path)
    sorter.read_data()
    sorter.sort(sort_field, reverse=reverse_sort)
    sorter.write()


if __name__ == "__main__":
    main()
