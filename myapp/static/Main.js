let jsonData = null;

document.getElementById("copyUploadedBtn").style.display = "none";
document.getElementById("downloadUploadedBtn").style.display = "none";
document.getElementById("copySortedBtn").style.display = "none";
document.getElementById("downloadSortedBtn").style.display = "none";

document.getElementById("fileInput").addEventListener("change", handleFileSelect);
document.getElementById("sortBtn").addEventListener("click", sortJson);
document.getElementById("downloadUploadedBtn").addEventListener("click", downloadUploadedFile);
document.getElementById("downloadSortedBtn").addEventListener("click", downloadSortedFile);

function downloadSortedFile() {
    const sortedContent = document.getElementById("sortedContentDisplay").innerText;
    if (!sortedContent) {
        alert("Нет данных для скачивания.");
        return;
    }
    // const blob = new Blob([sortedContent], { type: "application/json" });

    const blob = new Blob([sortedContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    // a.download = "sorted_data_with.json";
    a.download = "sorted_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadUploadedFile() {
    if (!jsonData) 
    {
        alert("Нет загруженного файла.");
        // return 0; нельзя завершать программу до того, как данные будут загружены
        alert("Нет данных для скачивания.");
        return;
    }
    // константы для вывода на экран

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Создаем ссылку для скачивания
    const a = document.createElement("a");
    a.href = url;
    a.download = "uploaded_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Обновляем список полей для сортировки

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

                // Показываем кнопки после успешной загрузки файла
                document.getElementById("copyUploadedBtn").style.display = "block";
                document.getElementById("downloadUploadedBtn").style.display = "block";
            } catch (error) {
                // Отображаем ошибку при чтении файла
                document.getElementById("result").textContent = "Ошибка при чтении файла: " + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        // Отображаем пользователю все что нужно сделать при выборе файла
        document.getElementById("result").textContent = "Пожалуйста, выберите корректный JSON-файл.";
    }
}

function formatJsonWithLineNumbers(data) {
    const jsonString = JSON.stringify(data, null, 2);
    return jsonString.split('\n').map(line => `<div>${line}</div>`).join('');
}

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

async function sortJson() {
    const sortField = document.getElementById("sort_field").value;
    const reverseSort = document.getElementById("reverse_sort").value === "yes";

    if (!jsonData || jsonData.length === 0) {
        document.getElementById("result").textContent = "Пожалуйста, загрузите JSON-файл сначала.";
        return;
    }

    const response = await fetch("/sort", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            json_data: jsonData,
            sort_field: sortField,
            reverse_sort: reverseSort ? "yes" : "no"
        })
    });

    const result = await response.json();
    if (result.status === "error") {
        document.getElementById("result").textContent = result.message;
    } else {
        document.getElementById("sortedContentDisplay").innerHTML = formatJsonWithLineNumbers(result.sorted_data);
        document.getElementById("copySortedBtn").style.display = "block";
        document.getElementById("downloadSortedBtn").style.display = "block"; 
        document.getElementById("result").textContent = "Сортировка завершена!";
    }
}

document.getElementById("copyUploadedBtn").addEventListener("click", copyUploadedContent);
document.getElementById("copySortedBtn").addEventListener("click", copySortedContent);

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