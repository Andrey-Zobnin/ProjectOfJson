let jsonData = null;
let csvData = null;
let convertedData = null;

document.getElementById("copyUploadedBtn").style.display = "none";
document.getElementById("downloadUploadedBtn").style.display = "none";
document.getElementById("copySortedBtn").style.display = "none";
document.getElementById("downloadSortedBtn").style.display = "none";
document.getElementById("convertJsonToCsvBtn").style.display = "none";
document.getElementById("downloadConvertedBtn").style.display = "none";
document.getElementById("copyConvertedBtn").style.display = "none";

document.getElementById("fileInput").addEventListener("change", handleFileSelect);
document.getElementById("sortBtn").addEventListener("click", sortJson);
document.getElementById("downloadUploadedBtn").addEventListener("click", downloadUploadedFile);
document.getElementById("downloadSortedBtn").addEventListener("click", downloadSortedFile);
document.getElementById("csvFileInput").addEventListener("change", handleCsvFileSelect);
document.getElementById("convertCsvToJsonBtn").addEventListener("click", convertCsvToJson);
document.getElementById("convertJsonToCsvBtn").addEventListener("click", convertJsonToCsv);

document.getElementById("reverse_sort").addEventListener("change", function() {
    const valueInputGroup = document.getElementById("valueInputGroup");
    if (this.value === "value") {
        valueInputGroup.style.display = "block";
    } else {
        valueInputGroup.style.display = "none";
        document.getElementById("sort_value").value = "";
    }
});

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

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                jsonData = JSON.parse(e.target.result);
                document.getElementById("contentDisplay").innerHTML = formatJsonWithLineNumbers(jsonData);
                document.getElementById("result").textContent = "Файл загружен успешно!";
                updateSortFieldOptions(jsonData);
                displayFileInfo(file, jsonData.length);
                document.getElementById("convertJsonToCsvBtn").style.display = "block";
            } catch (error) {
                document.getElementById("result").textContent = "Ошибка при чтении файла: " + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById("result").textContent = "Пожалуйста, выберите корректный JSON-файл.";
    }
}

function handleCsvFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
            csvData = e.target.result;
            document.getElementById("conversionResultDisplay").innerText = csvData;
        };
        reader.readAsText(file);
    } else {
        alert("Пожалуйста, выберите корректный CSV-файл.");
    }
}

function convertJsonToCsv() {
    if (!jsonData) {
        alert("Сначала загрузите JSON-файл.");
        return;
    }

    const csv = jsonToCsv(jsonData);
    document.getElementById("conversionResultDisplay").innerText = csv;
    downloadCsv(csv, "converted_data.csv");

    const convertedFileSize = (new Blob([csv]).size / 1024).toFixed(2);
    const convertedLineCount = csv.split('\n').length;
    const convertedFileInfo = document.getElementById("convertedFileInfo");
    convertedFileInfo.textContent = `Количество строк: ${convertedLineCount}, Размер файла: ${convertedFileSize} КБ`;

    document.getElementById("downloadConvertedBtn").style.display = "block";
    document.getElementById("copyConvertedBtn").style.display = "block";
}

function convertCsvToJson() {
    if (!csvData) {
        alert("Сначала загрузите CSV-файл.");
        return;
    }

    const json = csvToJson(csvData);
    document.getElementById("conversionResultDisplay").innerHTML = formatJsonWithLineNumbers(json);

    const convertedFileSize = (new Blob([JSON.stringify(json)]).size / 1024).toFixed(2);
    const convertedLineCount = json.length;
    const convertedFileInfo = document.getElementById("convertedFileInfo");
    convertedFileInfo.textContent = `Количество строк: ${convertedLineCount}, Размер файла: ${convertedFileSize} КБ`;

    document.getElementById("downloadConvertedBtn").style.display = "none";
    document.getElementById("copyConvertedBtn").style.display = "none";
}

function jsonToCsv(json) {
    const rows = [];
    const headers = Object.keys(json[0]);
    rows.push(headers.join(','));

    for (const item of json) {
        const values = headers.map(header => item[header]);
        rows.push(values.join(','));
    }

    return rows.join('\n');
}

function csvToJson(csv) {
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
}

function downloadCsv(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function formatJsonWithLineNumbers(data) {
    const jsonString = JSON.stringify(data, null, 2);
    return jsonString.split('\n').map(line => `<div>${line}</div>`).join('');
}

function displayFileInfo(file, lineCount) {
    const uploadedFileInfo = document.getElementById("uploadedFileInfo");
    const fileSize = (file.size / 1024).toFixed(2);
    uploadedFileInfo.textContent = `Количество строк: ${lineCount}, Размер файла: ${fileSize} КБ`;
}

document.getElementById("copyUploadedBtn").addEventListener("click", copyUploadedContent);
document.getElementById("copySortedBtn").addEventListener("click", copySortedContent);
document.getElementById("copyConvertedBtn").addEventListener("click", copyConvertedContent);

function copyUploadedContent() {
    const uploadedContent = document.getElementById("contentDisplay").innerText;
    navigator.clipboard.writeText(uploadedContent).then(() => {
        alert("Содержимое загруженного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

function copySortedContent() {
    const sortedContent = document.getElementById("sortedContentDisplay").innerText;
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert("Содержимое отсортированного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

function copyConvertedContent() {
    const convertedContent = document.getElementById("conversionResultDisplay").innerText;
    navigator.clipboard.writeText(convertedContent).then(() => {
        alert("Содержимое конвертированного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}