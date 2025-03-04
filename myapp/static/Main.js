let jsonData = null;

// Скрываем кнопки при загрузке страницы
document.getElementById("copyUploadedBtn").style.display = "none";
document.getElementById("downloadUploadedBtn").style.display = "none";
document.getElementById("copySortedBtn").style.display = "none";
document.getElementById("downloadSortedBtn").style.display = "none";

// Обработчики событий для кнопок
document.getElementById("convertToJsonBtn").addEventListener("click", convertToJsonHandler);
document.getElementById("convertToCsvBtn").addEventListener("click", convertToCsvHandler);
document.getElementById("downloadConvertedBtn").addEventListener("click", downloadConvertedFile);
document.getElementById("fileInput").addEventListener("change", handleFileSelect);
document.getElementById("sortBtn").addEventListener("click", sortJson);
document.getElementById("downloadUploadedBtn").addEventListener("click", downloadUploadedFile);
document.getElementById("downloadSortedBtn").addEventListener("click", downloadSortedFile);
document.getElementById("copyUploadedBtn").addEventListener("click", copyUploadedContent);
document.getElementById("copySortedBtn").addEventListener("click", copySortedContent);

// Управление отображением поля ввода значения
document.getElementById("reverse_sort").addEventListener("change", function() {
    const valueInputGroup = document.getElementById("valueInputGroup");
    if (this.value === "value") {
        valueInputGroup.style.display = "block"; // Показываем поле для ввода значения
    } else {
        valueInputGroup.style.display = "none"; // Скрываем поле для ввода значения
        document.getElementById("sort_value").value = ""; // Очищаем поле
    }
});

// Функция для скачивания отсортированного файла
function downloadSortedFile() {
    const sortedContent = document.getElementById("sortedContentDisplay").innerText;
    if (!sortedContent) {
        alert("Нет данных для скачивания.");
        return;
    }
    const blob = new Blob([sortedContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sorted_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Функция для конвертации JSON в CSV
function convertJsonToCsv(jsonData) {
    const csvContent = [];
    const headers = Object.keys(jsonData[0]);
    csvContent.push(headers.join(","));

    jsonData.forEach((row) => {
        const rowContent = headers.map((header) => {
            return row[header];
        }).join(",");
        csvContent.push(rowContent);
    });

    return csvContent.join("\n");
}

// Функция для конвертации CSV в JSON
function convertCsvToJson(csvContent) {
    const jsonData = [];
    const rows = csvContent.split("\n");
    const headers = rows.shift().split(",");

    rows.forEach((row) => {
        if (row.trim() === "") return; // Пропускаем пустые строки
        const obj = {};
        const values = row.split(",");
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        jsonData.push(obj);
    });

    return jsonData;
}

// Обработчик конвертации в JSON
function convertToJsonHandler() {
    const csvContent = document.getElementById("convertedContent").value;
    if (!csvContent) {
        alert("Нет данных для конвертации.");
        return;
    }
    const jsonData = convertCsvToJson(csvContent);
    document.getElementById("convertedContent").value = JSON.stringify(jsonData, null, 2);
    document.getElementById("downloadConvertedBtn").style.display = "block";
}

// Обработчик конвертации в CSV
function convertToCsvHandler() {
    const jsonContent = document.getElementById("convertedContent").value;
    if (!jsonContent) {
        alert("Нет данных для конвертации.");
        return;
    }
    try {
        const jsonData = JSON.parse(jsonContent);
        const csvContent = convertJsonToCsv(jsonData);
        document.getElementById("convertedContent").value = csvContent;
        document.getElementById("downloadConvertedBtn").style.display = "block";
    } catch (error) {
        alert("Ошибка при парсинге JSON: " + error.message);
    }
}

// Функция для скачивания конвертированного файла
function downloadConvertedFile() {
    const convertedContent = document.getElementById("convertedContent").value;
    if (!convertedContent) {
        alert("Нет данных для скачивания.");
        return;
    }

    const format = prompt("Введите формат для скачивания (json/csv):").toLowerCase();
    if (format === "json") {
        const blob = new Blob([convertedContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else if (format === "csv") {
        const blob = new Blob([convertedContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted_data.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("Неподдерживаемый формат.");
    }
}

// Функция для отображения информации о файле
function displayFileInfo(file, lineCount) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    if (!file || !lineCount) {
        uploadedFileInfo.textContent = "Файл не загружен или не содержит данных.";
        return;
    }
    const fileSize = (file.size / 1024).toFixed(2); // Размер в КБ
    uploadedFileInfo.textContent = `Количество строк: ${lineCount}, Размер файла: ${fileSize} КБ`;
}

// Функция для форматирования JSON с номерами строк
function formatJsonWithLineNumbers(data) {
    const jsonString = JSON.stringify(data, null, 2);
    return `<pre>${jsonString}</pre>`;
}

// Функция для обновления опций сортировки
function updateSortFieldOptions(data) {
    const sortFieldSelect = document.getElementById("sort_field");
    sortFieldSelect.innerHTML = "";

    if (data.length > 0) {
        const fields = Object.keys(data[0]);
        fields.forEach(field => {
            const option = document.createElement("option");
            option.value = field;
            option.textContent = field;
            sortFieldSelect.appendChild(option);
        });
    }
}

// Функция для сортировки JSON
async function sortJson() {
    try {
        const sortField = document.getElementById("sort_field").value;
        const sortValue = document.getElementById("sort_value").value;
        const reverseSort = document.getElementById("reverse_sort").value === "yes";

        if (!jsonData || jsonData.length === 0) {
            document.getElementById("result").textContent = "Пожалуйста, загрузите JSON-файл сначала.";
            return;
        }

        const requestBody = {
            json_data: jsonData,
            sort_field: sortField,
            reverse_sort: reverseSort ? "yes" : "no"
        };

        if (document.getElementById("reverse_sort").value === "value") {
            requestBody.sort_value = sortValue;
        }

        const response = await fetch("/sort", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error("Ошибка при выполнении запроса на сервер.");
        }

        const result = await response.json();
        if (result.status === "error") {
            document.getElementById("result").textContent = result.message;
        } else {
            document.getElementById("sortedContentDisplay").innerHTML = formatJsonWithLineNumbers(result.sorted_data);
            document.getElementById("copySortedBtn").style.display = "block";
            document.getElementById("downloadSortedBtn").style.display = "block";
            document.getElementById("result").textContent = "Сортировка завершена!";

            const sortedFileSize = new Blob([JSON.stringify(result.sorted_data)]).size;
            const sortedLineCount = result.sorted_data.length;
            const sortedFileInfo = document.getElementById("sortedFileInfo");
            sortedFileInfo.textContent = `Количество строк: ${sortedLineCount}, Размер файла: ${(sortedFileSize / 1024).toFixed(2)} КБ`;
        }
    } catch (error) {
        console.error("Ошибка при сортировке: ", error);
        document.getElementById("result").textContent = "Ошибка при сортировке: " + error.message;
    }
}

// Функция для копирования содержимого загруженного файла
function copyUploadedContent() {
    const uploadedContent = document.getElementById("contentDisplay").innerText;
    if (!uploadedContent) {
        alert("Нет данных для копирования.");
        return;
    }
    navigator.clipboard.writeText(uploadedContent).then(() => {
        alert("Содержимое загруженного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

// Функция для копирования содержимого отсортированного файла
function copySortedContent() {
    const sortedContent = document.getElementById("sortedContentDisplay").innerText;
    if (!sortedContent) {
        alert("Нет данных для копирования.");
        return;
    }
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert("Содержимое отсортированного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

// Функция для обработки выбора файла
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Файл не выбран.");
        return;
    }
    if (file.type !== "application/json") {
        alert("Пожалуйста, выберите JSON-файл.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            jsonData = JSON.parse(e.target.result);
            updateSortFieldOptions(jsonData);
            document.getElementById("contentDisplay").innerHTML = formatJsonWithLineNumbers(jsonData);
            document.getElementById("copyUploadedBtn").style.display = "block";
            document.getElementById("downloadUploadedBtn").style.display = "block";
            displayFileInfo(file, jsonData.length);
        } catch (error) {
            alert("Ошибка при чтении файла: " + error.message);
        }
    };
    reader.readAsText(file);
}

// Функция для скачивания загруженного файла
function downloadUploadedFile() {
    if (!jsonData) {
        alert("Нет данных для скачивания.");
        return;
    }
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "uploaded_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}