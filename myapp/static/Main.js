let jsonData = null;
let sortedData = null;
let currentLanguage = 'ru'; // defualt launguage

document.getElementById("fileInput").addEventListener("change", handleFileSelect);

document.getElementById("dropArea").addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add("bg-light");
});

document.getElementById("dropArea").addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove("bg-light");
});

document.getElementById("dropArea").addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove("bg-light");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
});

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                jsonData = JSON.parse(e.target.result);
                document.getElementById("contentDisplay").textContent = JSON.stringify(jsonData, null, 2);
                document.getElementById("result").textContent = "Файл загружен успешно!";
            } catch (error) {
                document.getElementById("result").textContent = "Ошибка при чтении файла: " + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById("result").textContent = "Пожалуйста, выберите корректный JSON-файл.";
    }
}

async function sortJson() {
    const sortField = document.getElementById("sort_field").value;
    const reverseSort = document.getElementById("reverse_sort").value === "yes";

    if (!jsonData) {
        document.getElementById("result").textContent = "Пожалуйста, загрузите JSON-файл сначала.";
        return;
    }

    const sortedData = jsonData.sort((a, b) => {
        if (reverseSort) {
            return b[sortField] < a[sortField] ? -1 : 1;
        } else {
            return a[sortField] < b[sortField] ? -1 : 1;
        }
    });

    document.getElementById("sortedContentDisplay").textContent = JSON.stringify(sortedData, null, 2);
    document.getElementById("copySortedBtn").style.display = "block";
    document.getElementById("result").textContent = "Сортировка завершена!";
}

function copyUploadedContent() {
    const uploadedContent = document.getElementById("contentDisplay").textContent;
    navigator.clipboard.writeText(uploadedContent).then(() => {
        alert("Содержимое загруженного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}

function copySortedContent() {
    const sortedContent = document.getElementById("sortedContentDisplay").textContent;
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert("Содержимое отсортированного файла скопировано в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка при копировании: ", err);
    });
}