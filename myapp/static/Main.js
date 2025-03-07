let jsonData = null;

// Скрываем кнопки копирования и скачивания при загрузке страницы
document.getElementById("copyUploadedBtn").style.display = "none";
document.getElementById("downloadUploadedBtn").style.display = "none";
document.getElementById("copySortedBtn").style.display = "none";
document.getElementById("downloadSortedBtn").style.display = "none";

// Обработчики событий для выбора файла, сортировки и скачивания
document.getElementById("fileInput").addEventListener("change", handleFileSelect);
document.getElementById("sortBtn").addEventListener("click", sortJson);
document.getElementById("downloadUploadedBtn").addEventListener("click", downloadUploadedFile);
document.getElementById("downloadSortedBtn").addEventListener("click", downloadSortedFile);

// Управление отображением полей ввода значения и зависимости
document.getElementById("reverse_sort").addEventListener("change", function () {
    const valueInputGroup = document.getElementById("valueInputGroup");
    const dependencyInputGroup = document.getElementById("dependencyInputGroup");

    if (this.value === "value") {
        valueInputGroup.style.display = "block";
        dependencyInputGroup.style.display = "none";
    } else if (this.value === "dependency") {
        valueInputGroup.style.display = "none";
        dependencyInputGroup.style.display = "block";
        updateSecondFieldOptions(jsonData); // Обновляем список полей для второго признака
    } else {
        valueInputGroup.style.display = "none";
        dependencyInputGroup.style.display = "none";
    }
});

// Функция для форматирования чисел (добавляет пробелы для выравнивания)
function formatNumber(num) {
    if (num < 10) {
        return '  ' + num; // 2 пробела перед числом
    } else if (num < 100) {
        return ' ' + num; // 1 пробел перед числом
    } else {
        return num.toString(); // без пробелов
    }
}

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

// Функция для скачивания загруженного файла
function downloadUploadedFile() {
    if (!jsonData) {
        alert("Нет загруженного файла.");
        return;
    }

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "uploaded_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Функция для обработки выбора файла
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                jsonData = JSON.parse(e.target.result);
                document.getElementById("contentDisplay").innerHTML = formatJsonWithLineNumbers(jsonData);
                document.getElementById("result").textContent = "Файл загружен успешно!";
                updateSortFieldOptions(jsonData); // Обновляем список полей для сортировки

                // Отображаем информацию о загруженном файле
                displayFileInfo(file, jsonData.length);

                // Показываем кнопки копирования и скачивания
                document.getElementById("copyUploadedBtn").style.display = "block";
                document.getElementById("downloadUploadedBtn").style.display = "block";

                // Проверяем, если параметр сортировки уже выбран
                const sortSelect = document.getElementById("reverse_sort");
                if (sortSelect.value === "value") {
                    document.getElementById("valueInputGroup").style.display = "block"; // Показываем поле для ввода значения
                }
            } catch (error) {
                document.getElementById("result").textContent = "Ошибка при чтении файла: " + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById("result").textContent = "Пожалуйста, выберите корректный JSON-файл.";
    }
}

// Функция для отображения информации о файле
function displayFileInfo(file, lineCount) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    const fileSize = (file.size / 1024).toFixed(2); // Размер в КБ
    uploadedFileInfo.textContent = `Количество строк: ${lineCount}, Размер файла: ${fileSize} КБ`;
}

// Функция для форматирования JSON с номерами строк
function formatJsonWithLineNumbers(data) {
    const formattedData = data.map(item => {
        return {
            ...item,
            age: formatNumber(item.age),
            salary: formatNumber(item.salary),
            experience: formatNumber(item.experience)
        };
    });
    const jsonString = JSON.stringify(formattedData, null, 2);
    return jsonString.split('\n').map(line => `<div>${line}</div>`).join('');
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

// Функция для обновления второго поля для сортировки по зависимости
function updateSecondFieldOptions(data) {
    const secondFieldSelect = document.getElementById("second_field");
    secondFieldSelect.innerHTML = "";

    if (data && data.length > 0) {
        const fields = Object.keys(data[0]);
        fields.forEach(field => {
            const option = document.createElement("option");
            option.value = field;
            option.textContent = field;
            secondFieldSelect.appendChild(option);
        });
    }
}

// Функция для сортировки JSON
async function sortJson() {
    const sortField = document.getElementById("sort_field").value;
    const sortValue = document.getElementById("sort_value").value;
    const reverseSort = document.getElementById("reverse_sort").value === "yes"; // true/false
    const dependencyType = document.getElementById("dependency_type").value;
    const secondField = document.getElementById("second_field").value;

    if (!jsonData || jsonData.length === 0) {
        document.getElementById("result").textContent = "Пожалуйста, загрузите JSON-файл сначала.";
        return;
    }

    const requestBody = {
        json_data: jsonData,
        sort_field: sortField,
        reverse_sort: reverseSort, // передаем true/false
        dependency_type: dependencyType,
        second_field: secondField
    };

    // Если выбрана сортировка по значению, добавляем значение в запрос
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

    const result = await response.json();
    if (result.status === "error") {
        document.getElementById("result").textContent = result.message;
    } else {
        document.getElementById("sortedContentDisplay").innerHTML = formatJsonWithLineNumbers(result.sorted_data);
        document.getElementById("copySortedBtn").style.display = "block";
        document.getElementById("downloadSortedBtn").style.display = "block";
        document.getElementById("result").textContent = "Сортировка завершена!";

        // Добавляем информацию о размере и количестве строк отсортированного файла
        const sortedFileSize = new Blob([JSON.stringify(result.sorted_data)]).size; // Размер отсортированных данных
        const sortedLineCount = result.sorted_data.length; // Количество строк
        const sortedFileInfo = document.getElementById("sortedFileInfo");
        sortedFileInfo.textContent = `Количество строк: ${sortedLineCount}, Размер файла: ${(sortedFileSize / 1024).toFixed(2)} КБ`;
    }
}

// Обработчики событий для копирования содержимого
document.getElementById("copyUploadedBtn").addEventListener("click", copyUploadedContent);
document.getElementById("copySortedBtn").addEventListener("click", copySortedContent);

// Функция для копирования содержимого загруженного файла
function copyUploadedContent() {
    const uploadedContent = document.getElementById("contentDisplay").innerText;
    navigator.clipboard.writeText(uploadedContent).then(() => {
        alert("Содержимое загруженного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

// Функция для копирования содержимого отсортированного файла
function copySortedContent() {
    const sortedContent = document.getElementById("sortedContentDisplay").innerText;
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert("Содержимое отсортированного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}