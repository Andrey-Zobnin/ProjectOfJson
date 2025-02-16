import json
import time
"""
ToDo 
import os
import sys 
"""
class Sorter:
    # инициализируем файлы
    def __init__(self, file_path):

        """
              
        Initializes the Sorter object with a file path.

        :param file_path: The path to the JSON file to be sorted
        :type file_path: str

        :raises ImportError: If the file does not exist
        """

        # проверяем есть ли в файле указанные данные и сортируем их
        try:
            self.file_path = file_path
            self.data = None
        except ImportError as init_error:
            print(f"Error: Init failed: {init_error} ")

    def read_data(self):

        """
        Reads data from the JSON file given in the constructor.

        If the file does not exist, it will print an error message and set
        self.data to an empty list.

        If the file contains invalid JSON data, it will print an error message
        and set self.data to an empty list.

        :raises FileNotFoundError: If the file does not exist.
        :raises json.JSONDecodeError: If the JSON data is invalid.
        """

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

        """
        Sorts the data by the given field.

        If the data has not been read yet, it will call read_data().

        If the data is not a list, it will print an error message and do nothing.

        :param field: The field to sort the data by
        :type field: str

        :param reverse: Whether to sort in reverse order
        :type reverse: bool

        :raises KeyError: If the field does not exist in the data
        """

        if self.data is None:
            self.read_data()
        if self.data:
            try:
                # проверяем на то есть ли в файле указанные данные и сортируем их
                self.data = [item for item in self.data if isinstance(item, dict)]
                self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
            except KeyError as key_error:
                print(f"Error: Invalid sort field: {key_error}")
        else:
            print("Error: No data to sort")

    def write_data_json(self):

        """
        Writes the sorted data to the JSON file given in the constructor.

        If there is an error writing to the file, it will print an error message.

        :raises IOError: If the file cannot be written to.
        """

        try:
            with open(self.file_path, "w") as file_data:
                json.dump(self.data, file_data)
        except IOError as write_error:
            print(f"Error: Error writing to file: {write_error}")


def main():

    """
    The main entry point of the application.

    Asks the user for a JSON file path, a field to sort by, and whether to sort in reverse order.
    Then it calls the fordevelopers and run functions.

    :return: None
    """

    file_path = input("Введите путь к JSON-файлу для сортировки: ")
    sort_field = input("Введите поле для сортировки: ")
    reverse_sort_input = input("Хотите выполнить сортировку по убыванию? (Введите 'yes' или 'no'): ")
    reverse_sort = reverse_sort_input.lower() == "yes"
    todo = ToDo(file_path, sort_field, reverse_sort_input)
    todo.fordevelopers()
    run(file_path, sort_field, reverse_sort)


def run(file_path, sort_field, reverse_sort):

    """
    Starts the application.

    Prints a message, waits for a second, creates a Sorter object, waits for another second,
    reads the data, waits for another second, sorts the data, waits for another 2 seconds, and
    writes the sorted data to the file.

    :param str file_path: The path to the file to sort.
    :param str sort_field: The field to sort by.
    :param bool reverse_sort: Whether to sort in reverse order.
    :return: None
    """

    print("Application starting...")
    time.sleep(1)
    print("wait")
    sorter = Sorter(file_path)
    time.sleep(1)
    print(".")
    sorter.read_data()
    time.sleep(1)
    print("..")
    sorter.sort_data(sort_field, reverse=reverse_sort)
    time.sleep(2)
    print("...")
    sorter.write_data_json()
    print("Sorting complete.")


class ToDo:
    def __init__(self, file_path, sort_field, reverse_sort_input):

        """
        The constructor for the ToDo class.

        :param file_path: The path to the JSON file to sort.
        :param sort_field: The field to sort by.
        :param reverse_sort_input: Whether to sort in reverse order.
        :return: None
        """

        self.file_path = file_path
        self.sort_field = sort_field
        self.reverse_sort_input = reverse_sort_input

    def fordevelopers(self):

        """
        Checks if the file_path, sort_field, or reverse_sort_input is in the list of
        keywords and calls restart_code() if it is.

        :return: None
        """

        keywords = ['a', 'b', 'restart_code']
        if self.file_path == keywords[2]:
            restart_code()
        elif self.sort_field == keywords[2]:
            restart_code()
        elif self.reverse_sort_input == keywords[2]:
            restart_code()


def restart_code():

    """
    Restarts the main function.

    This function is used when the user input is one of the keywords in the list
    of keywords. It prints a message to the user and restarts the main function.

    :return: None
    """

    print("Программа будет перезапущена")
    time.sleep(2)
    print("Restarting main function...")
    main()


if __name__ == "__main__":
    main()