const App = (() => {
    let jsonData = null;
    let csvData = null;

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
    };

    const showConversionSection = (fileType) => {
        document.getElementById("conversionSection").style.display = "block";
        document.getElementById("conversionFileInput").accept = fileType;
        document.getElementById("convertBtn").style.display = "block";
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

    const handleConversionFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (file.type === "application/json") {
                    jsonData = JSON.parse(e.target.result);
                } else if (file.type === "text/csv") {
                    csvData = e.target.result;
                }
                document.getElementById("convertBtn").style.display = "block"; // Показать кнопку конвертации
            };
            reader.readAsText(file);
        } else {
            alert("Пожалуйста, выберите корректный файл.");
        }
    };

    const convertFile = () => {
        if (jsonData) {
            convertJsonToCsv();
        } else if (csvData) {
            convertCsvToJson();
        } else {
            alert("Сначала загрузите файл для конвертации.");
        }
    };

    const convertJsonToCsv = () => {
        if (!jsonData) {
            alert("Сначала загрузите JSON-файл.");
            return;
        }

        const csv = jsonToCsv(jsonData);
        updateConversionResultDisplay(csv);
        downloadCsv(csv, "converted_data.csv");
    };

    const convertCsvToJson = () => {
        if (!csvData) {
            alert("Сначала загрузите CSV-файл.");
            return;
        }

        const json = csvToJson(csvData);
        updateConversionResultDisplay(formatJsonWithLineNumbers(json));
    };

    const updateContentDisplay = (data) => {
        document.getElementById("contentDisplay").innerHTML = formatJsonWithLineNumbers(data);
    };

    const updateConversionResultDisplay = (result) => {
        document.getElementById("conversionResultDisplay").innerHTML = result;
    };

    const jsonToCsv = (json) => {
        const rows = [];
        const headers = Object.keys(json[0]);
        rows.push(headers.join(','));

        for (const item of json) {
            const values = headers.map(header => item[header]);
            rows.push(values.join(','));
        }

        return rows.join('\n');
    };

    const csvToJson = (csv) => {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j];
            }

            result.push(obj);
        }

        return result;
    };

    const downloadCsv = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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

    const sortJson = () => {
        const sortField = document.getElementById("sort_field").value;
        const reverseSort = document.getElementById("reverse_sort").value === "yes";
        const sortValue = document.getElementById("sort_value").value;

        if (!sortField) {
            alert("Пожалуйста, выберите поле для сортировки.");
            return;
        }

        let sortedData = [...jsonData];

        if (sortValue) {
            sortedData = sortedData.filter(item => item[sortField] == sortValue);
        }

        sortedData.sort((a, b) => {
            if (a[sortField] < b[sortField]) return reverseSort ? 1 : -1;
            if (a[sortField] > b[sortField]) return reverseSort ? -1 : 1;
            return 0;
        });

        document.getElementById("sortedContentDisplay").innerHTML = formatJsonWithLineNumbers(sortedData);
        document.getElementById("copySortedBtn").style.display = "block";
        document.getElementById("downloadSortedBtn").style.display = "block";
        document.getElementById("result").style.display = "block";
        document.getElementById("result").textContent = "Сортировка завершена";
    };

    return {
        init,
    };
})();

document.addEventListener("DOMContentLoaded", App.init);