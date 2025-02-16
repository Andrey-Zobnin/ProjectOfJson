let jsonData = null;
let sortedData = null;

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
                document.getElementById("result").textContent = "File loaded successfully!";
                displayFileContent(jsonData);
            } catch (error) {
                document.getElementById("result").textContent = "Error reading file: " + error.message;
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById("result").textContent = "Please select a valid JSON file.";
    }
}

function populateSortField(data) {
    const sortFieldSelect = document.getElementById("sort_field");
    sortFieldSelect.innerHTML = '<option value="">Select field</option>';

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
        document.getElementById("result").textContent = "Please upload a JSON file first.";
        return;
    }

    document.getElementById("progress").style.display = "block";
    document.getElementById("progressText").textContent = "Sorting in progress...";

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
        document.getElementById("copyBtn").style.display = "block";
        document.getElementById("downloadBtn").onclick = () => {
            window.location.href = `/download/${result.sorted_file}`;
        };
    } else {
        document.getElementById("downloadBtn").style.display = "none";
        document.getElementById("copyBtn").style.display = "none";
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

document.getElementById("copyBtn").addEventListener("click", () => {
    const sortedContent = document.getElementById("sortedContentDisplay").textContent;
    navigator.clipboard.writeText(sortedContent).then(() => {
        alert("The content of the sorted file has been copied to the clipboard!");
    }).catch(err => {
        console.error("Error copying: ", err);
    });
});