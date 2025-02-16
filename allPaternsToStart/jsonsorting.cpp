#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

class Sorter {
public:
    void init(const std::string& file_path) {
        this->file_path = file_path;
        data.clear();
    }

    void read_data() {
        std::ifstream file(file_path);
        if (!file.is_open()) {
            std::cerr << "Error: File not found: " << file_path << std::endl;
            return;
        }
        
        try {
            file >> data;
            if (!data.is_array()) {
                data = json::array();
            }
        } catch (json::parse_error& e) {
            std::cerr << "Error: Invalid JSON file: " << e.what() << std::endl;
            data = json::array();
        }
    }

    void sort_data(const std::string& field, bool reverse = false) {
        if (data.empty()) {
            read_data();
        }
        if (!data.empty()) {
            try {
                std::vector<json> filtered_data;
                for (const auto& item : data) {
                    if (item.is_object()) {
                        filtered_data.push_back(item);
                    }
                }
                data = filtered_data;

                std::sort(data.begin(), data.end(), [&](const json& a, const json& b) {
                    return reverse ? a[field].get<std::string>() > b[field].get<std::string>() :
                                     a[field].get<std::string>() < b[field].get<std::string>();
                });
            } catch (const std::exception& e) {
                std::cerr << "Нет данных для сортировки по ключевому слову" << std::endl;
                std::cerr << "Error: Invalid sort field: " << e.what() << std::endl;
            }
        } else {
            std::cerr << "Нет данных для сортировки" << std::endl;
            std::cerr << "Error: No data to sort" << std::endl;
        }
    }

    void write_data_json() {
        std::ofstream file(file_path);
        if (!file.is_open()) {
            std::cerr << "Error: Error writing to file." << std::endl;
            return;
        }
        file << data.dump(4); // форматирование с отступами
    }

private:
    std::string file_path;
    json data;
};

void run(const std::string& file_path, const std::string& sort_field, bool reverse_sort) {
    Sorter sorter;
    sorter.init(file_path);
    sorter.read_data();
    sorter.sort_data(sort_field, reverse_sort);
    sorter.write_data_json();
}


// Restart the program if any of the input parameters match the restart code keyword
double fordevelopers(const std::string& file_path, const std::string& sort_field, const std::string& reverse_sort_input) {
    // Define a list of keywords to check for restart code
    const std::vector<std::string> keywords = { "a", "b", "restart_code" };
    
    // Check if any of the input parameters match the restart code keyword
    if (file_path == keywords[2] || sort_field == keywords[2] || reverse_sort_input == keywords[2]) {
        // Notify the user that the program will restart
        std::cout << "Программа будет перезапущена" << std::endl;
        // Return a value to indicate that the program should restart
        return 0;
    }
}


int main() {
    std::string file_path, sort_field, reverse_sort_input;
    
    std::cout << "Введите путь к JSON-файлу для сортировки: ";
    std::getline(std::cin, file_path);
    
    std::cout << "Введите поле для сортировки: ";
    std::getline(std::cin, sort_field);
    
    std::cout << "Хотите выполнить сортировку по убыванию? (Введите 'yes' или 'no'): ";
    std::getline(std::cin, reverse_sort_input);
    
    bool reverse_sort = (reverse_sort_input == "yes");
    
    fordevelopers(file_path, sort_field, reverse_sort_input);
    run(file_path, sort_field, reverse_sort);
    
    return 0;
}
