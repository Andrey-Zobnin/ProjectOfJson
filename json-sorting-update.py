# импортируем важную библиотеку для проекта, а именно Утилита для сортровки файлов джейсон
import json
import logging


class Sorter:
    def __init__(self, file_path):
        # инициализируем файлы
        self.file_path = file_path
        self.data = None

    # чтение файла
    def read_data(self):
        try:
            # открываем с помощью with так как он имеет ряд важных примуществ в моем проекте
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    # проверяем на то есть ли в файле список, соответственно
                    # если нет то выводим Формат файла не соответствует ожидаемому
                    raise ValueError("Формат файла не соответствует ожидаемому")
        except FileNotFoundError:
            # проверка на то найден ли файл
            print("Файл не найден")
        except ValueError as e:
            # проверка на расчеты и математические ошибки то-есть на правильное чтение файла
            print("Ошибка при чтении файла:", e)

    # сортировка
    def sort(self, field, reverse=False):
        # если в файле данных нет, то вызывает метод read()
        if self.data is None:
            # вызывает метод read()
            self.read_data()
        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            # проверяем на, то являеться ли анные
            self.data = sorted(self.data, key=lambda x: x[field], reverse=reverse)
            # используя сортируем по полям указанным пользователем
        except KeyError:
            # если указанное поле не найдено выводиться "Данное поле", field, "не найдено... :("
            print("Данное поле", field, "не найдено... :(")

    # записываем данные сортировки обратно в файл
    def write(self):
        try:
            with open(self.file_path, "w") as f:
                json.dump(self.data, f)
        except IOError as e:
            print("Возникла ошибка при записи файла:", e)



# Ввод данных от пользователя
file_path = input("Введите путь к JSON-файлу для сортировки: ")
sort_field = input("Введите поле для сортировки: ")
reverse_sort_input = input("Хотите выполнить сортировку по убыванию? (Введите 'yes' или 'no'): ")
reverse_sort = reverse_sort_input.lower() == "yes"

# Создание экземпляра класса Sorter с передачей аргумента file_path
sorter = Sorter(file_path)

# Чтение данных из файла
sorter.read_data()
#  сортировка данных от пользователя
sorter.sort(sort_field, reverse=reverse_sort)

sorter.write()
