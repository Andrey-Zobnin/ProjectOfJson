const App = (() => {
    let jsonData = null;

    const init = () => {
        setupEventListeners();
    };

    const setupEventListeners = () => {
        document.getElementById("fileInput").addEventListener("change", handleFileSelect);
        document.getElementById("sortBtn").addEventListener("click", sortJson);
        document.getElementById("downloadUploadedBtn").addEventListener("click", downloadUploadedFile);
        document.getElementById("downloadSortedBtn").addEventListener("click", downloadSortedFile);
        document.getElementById("conversionFileInput").addEventListener("change", handleConversionFileSelect);
        document.getElementById("convertJsonToCsvBtn").addEventListener("click", () => {
            showConversionSection(".json");
        });
        document.getElementById("convertCsvToJsonBtn").addEventListener("click", () => {
            showConversionSection(".csv");
        });
        document.getElementById("convertBtn").addEventListener("click", convertFile);
        document.getElementById("reverse_sort").addEventListener("change", toggleValueInput);
    };

    const showConversionSection = (fileType) => {
        document.getElementById("conversionSection").style.display = "block";
        document.getElementById("conversionFileInput").accept = fileType;
        document.getElementById("convertBtn").style.display = "block";
    };

    const toggleValueInput = () => {
        const sortBy = document.getElementById("reverse_sort").value;
        const valueInputGroup = document.getElementById("valueInputGroup");
        if (sortBy === "value") {
            valueInputGroup.style.display = "block";
        } else {
            valueInputGroup.style.display = "none";
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    jsonData = JSON.parse(e.target.result);
                    updateContentDisplay(jsonData);
                    updateSortFieldOptions(jsonData);
                    displayFileInfo(file, jsonData.length);
                    document.getElementById("copyUploadedBtn").style.display = "block";
                    document.getElementById("downloadUploadedBtn").style.display = "block";
                    document.getElementById("convertJsonToCsvBtn").style.display = "block";
                } catch (error) {
                    alert("Ошибка при чтении файла: " + error.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert("Пожалуйста, выберите корректный JSON-файл.");
        }
    };

    const sortJson = () => {
        const sortField = document.getElementById("sort_field").value;
        const reverseSort = document.getElementById("reverse_sort").value;
        const sortValue = document.getElementById("sort_value").value;

        if (!sortField) {
            alert("Пожалуйста, выберите поле для сортировки.");
            return;
        }

        const requestData = {
            json_data: jsonData,
            sort_field: sortField,
            sort_value: sortValue,
            reverse_sort: reverseSort
        };

        fetch("/sort", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                alert(data.message);
            } else {
                const sortedData = data.sorted_data;
                document.getElementById("sortedContentDisplay").innerHTML = formatJsonWithLineNumbers(sortedData);
                document.getElementById("copySortedBtn").style.display = "block";
                document.getElementById("downloadSortedBtn").style.display = "block";
                document.getElementById("result").style.display = "block";
                document.getElementById("result").textContent = "Сортировка завершена";
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
        });
    };

    const updateContentDisplay = (data) => {
        document.getElementById("contentDisplay").innerHTML = formatJsonWithLineNumbers(data);
    };

    const updateSortFieldOptions = (data) => {
        const sortFieldSelect = document.getElementById("sort_field");
        sortFieldSelect.innerHTML = '<option value="">Выберите поле</option>'; // Сбросить предыдущие опции
        const fields = Object.keys(data[0]);
        fields.forEach(field => {
            const option = document.createElement("option");
            option.value = field;
            option.textContent = field;
            sortFieldSelect.appendChild(option);
        });
    };

    const formatJsonWithLineNumbers = (data) => {
        const jsonString = JSON.stringify(data, null, 2);
        return jsonString.split('\n').map(line => `<div>${line}</div>`).join('');
    };

    const displayFileInfo = (file, lineCount) => {
        const uploadedFileInfo = document.getElementById("uploadedFileInfo");
        const fileSize = (file.size / 1024).toFixed(2);
        uploadedFileInfo.textContent = `Количество строк: ${lineCount}, Размер файла: ${fileSize} КБ`;
    };

    return {
        init,
    };
})();

document.addEventListener("DOMContentLoaded", App.init);