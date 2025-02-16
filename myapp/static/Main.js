let jsonData = null;
let sortedData = null;
let currentLanguage = 'ru'; // Default language set to Russian

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
                populateSortField(jsonData);
                document.getElementById("result").textContent = getLocalizedText("fileLoaded");
                displayFileContent(jsonData);
            } catch (error) {
                document.getElementById("result").textContent = getLocalizedText("errorReadingFile") + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById("result").textContent = getLocalizedText("invalidFile");
    }
}

function populateSortField(data) {
    const sortFieldSelect = document.getElementById("sort_field");
    sortFieldSelect.innerHTML = '<option value="">' + getLocalizedText("selectField") + '</option>';

    if (Array.isArray(data) && data.length > 0) {
        const fields = Object.keys(data[0]);
        fields.forEach(field => {
            const option = document.createElement("option");
            option.value = field;
            option.textContent = field;
            sortFieldSelect.appendChild(option);
        });
    }
}

document.getElementById("sortBtn").addEventListener("click", async () => {
    const sortField = document.getElementById("sort_field").value;
    const reverseSort = document.getElementById("reverse_sort").value === "yes";

    if (!jsonData) {
        document.getElementById("result").textContent = getLocalizedText("uploadFileFirst");
        return;
    }

    document.getElementById("progress").style.display = "block";
    document.getElementById("progressText").textContent = getLocalizedText("sortingInProgress");

    const response = await fetch("/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sort_field: sortField,
            reverse_sort: reverseSort,
            json_data: jsonData
        }),
    });

    const result = await response.json();
    document.getElementById("result").textContent = result.message;

    document.getElementById("progress").style.display = "none";

    if (result.status === "success") {
        sortedData = result.sorted_data;
        displaySortedContent(sortedData);
        document.getElementById("downloadBtn").style.display = "block";
        document.getElementById("copySortedBtn").style.display = "block";
    } else {
        document.getElementById("downloadBtn").style.display = "none";
        document.getElementById("copySortedBtn").style.display = "none";
    }
});

function displayFileContent(data) {
    const contentDisplay = document.getElementById("contentDisplay");
    contentDisplay.textContent = JSON.stringify(data, null, 2);
}

function displaySortedContent(data) {
    const sortedContentDisplay = document.getElementById("sortedContentDisplay");
    sortedContentDisplay.textContent = JSON.stringify(data, null, 2);
}

document.getElementById("copyUploadedBtn").addEventListener("click", () => {
    const uploadedContent = document.getElementById("contentDisplay").textContent;
    navigator.clipboard.writeText(uploadedContent).then(() => {
        alert(getLocalizedText("uploadedContentCopied"));
    }).catch(err => {
        console.error("Error copying: ", err);
    });
});

document.getElementById("copySortedBtn").addEventListener("click", () => {
    const sortedContent = document.getElementById("sortedContentDisplay").textContent;
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert(getLocalizedText("sortedContentCopied"));
    }).catch(err => {
        console.error("Error copying: ", err);
    });
});

document.getElementById("languageSelect").addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    updateLanguage();
});

function updateLanguage() {
    document.getElementById("title").textContent = getLocalizedText("title");
    document.getElementById("fileInputLabel").textContent = getLocalizedText("fileInputLabel");
    document.getElementById("dropAreaText").textContent = getLocalizedText("dropAreaText");
    document.getElementById("sortFieldLabel").textContent = getLocalizedText("sortFieldLabel");
    document.getElementById("sortByLabel").textContent = getLocalizedText("sortByLabel");
    document.getElementById("sortBtn").textContent = getLocalizedText("sort");
    document.getElementById("downloadBtn").textContent = getLocalizedText("downloadSortedFile");
    document.getElementById("uploadedContentLabel").textContent = getLocalizedText("uploadedContentLabel");
    document.getElementById("sortedContentLabel").textContent = getLocalizedText("sortedContentLabel");
    document.getElementById("copyUploadedBtn").textContent = getLocalizedText("copyUploadedContent");
    document.getElementById("copySortedBtn").textContent = getLocalizedText("copySortedContent");
    document.getElementById("result").textContent = "";
    document.getElementById("progressText").textContent = getLocalizedText("loading");
}

function getLocalizedText(key) {
    const translations = {
        en: {
            title: "JSON Sorter",
            fileInputLabel: "Drag and drop a JSON file here:",
            dropAreaText: "Drag a file here or <input type='file' id='fileInput' accept='.json'>",
            sortFieldLabel: "Field to sort by:",
            sortByLabel: "Sort by:",
            sort: "Sort",
            downloadSortedFile: "Download Sorted File",
            uploadedContentLabel: "Uploaded File Content:",
            sortedContentLabel: "Sorted File Content:",
            copyUploadedContent: "Copy Uploaded Content",
            copySortedContent: "Copy Sorted Content",
            fileLoaded: "File loaded successfully!",
            errorReadingFile: "Error reading file: ",
            invalidFile: "Please select a valid JSON file.",
            selectField: "Select field",
            uploadFileFirst: "Please upload a JSON file first.",
            sortingInProgress: "Sorting in progress...",
            uploadedContentCopied: "The content of the uploaded file has been copied to the clipboard!",
            sortedContentCopied: "The content of the sorted file has been copied to the clipboard!",
            loading: "Loading..."
        },
        ru: {
            title: "Сортировщик JSON",
            fileInputLabel: "Перетащите JSON-файл сюда:",
            dropAreaText: "Перетащите файл сюда или <input type='file' id='fileInput' accept='.json'>",
            sortFieldLabel: "Поле для сортировки:",
            sortByLabel: "Сортировать по:",
            sort: "Сортировать",
            downloadSortedFile: "Скачать отсортированный файл",
            uploadedContentLabel: "Содержимое загруженного файла:",
            sortedContentLabel: "Содержимое отсортированного файла:",
            copyUploadedContent: "Скопировать содержимое загруженного файла",
            copySortedContent: "Скопировать содержимое отсортированного файла",
            fileLoaded: "Файл загружен успешно!",
            errorReadingFile: "Ошибка при чтении файла: ",
            invalidFile: "Пожалуйста, выберите корректный JSON-файл.",
            selectField: "Выберите поле",
            uploadFileFirst: "Сначала загрузите JSON-файл.",
            sortingInProgress: "Сортировка в процессе...",
            uploadedContentCopied: "Содержимое загруженного файла скопировано в буфер обмена!",
            sortedContentCopied: "Содержимое отсортированного файла скопировано в буфер обмена!",
            loading: "Загрузка..."
        }
    };
    return translations[currentLanguage][key];
}