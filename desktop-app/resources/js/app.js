/**
 * DataSort Pro - Desktop App Logic
 * Работает полностью оффлайн с использованием Neutralino.js API
 */

let originalData = null;
let resultData = null;
let currentFormat = null;

// Инициализация Neutralino
Neutralino.init();

// Обработчики событий Neutralino
Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    setupDropZone();
    setupEventListeners();
    showToast('Приложение готово к работе', 'success');
}

// =============================================================================
// Drag & Drop и загрузка файлов
// =============================================================================

function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        // Используем Neutralino API для чтения файла
        try {
            const path = await Neutralino.os.showOpenDialog('Выберите файл', {
                filters: [
                    { name: 'Data files', extensions: ['json', 'csv', 'xml'] }
                ]
            });

            if (path && path.length > 0) {
                await handleNeutralinoFile(path[0]);
            }
        } catch (error) {
            console.error('Ошибка выбора файла:', error);
        }
    });

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            await handleBrowserFile(e.target.files[0]);
        }
    });
}

async function handleNeutralinoFile(filePath) {
    showLoading('Загрузка файла...');

    try {
        const content = await Neutralino.filesystem.readFile(filePath);
        const fileName = filePath.split(/[\\/]/).pop();
        const ext = fileName.split('.').pop().toLowerCase();

        originalData = parseData(content, ext);
        currentFormat = ext;

        updateUI(fileName, content.length, originalData.length);
        populateFields(originalData);
        showOriginalData();

        hideLoading();
        showToast('Файл успешно загружен', 'success');

    } catch (error) {
        hideLoading();
        showToast('Ошибка чтения файла: ' + error.message, 'error');
    }
}

async function handleBrowserFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (!['json', 'csv', 'xml'].includes(ext)) {
        showToast('Неподдерживаемый формат', 'error');
        return;
    }

    showLoading('Загрузка файла...');

    try {
        const text = await file.text();
        originalData = parseData(text, ext);
        currentFormat = ext;

        updateUI(file.name, file.size, originalData.length);
        populateFields(originalData);
        showOriginalData();

        hideLoading();
        showToast('Файл успешно загружен', 'success');

    } catch (error) {
        hideLoading();
        showToast('Ошибка чтения файла: ' + error.message, 'error');
    }
}

function updateUI(fileName, fileSize, recordCount) {
    document.getElementById('fileName').textContent = fileName;
    document.getElementById('fileMeta').textContent =
        `${formatFileSize(fileSize)} • ${recordCount} записей • ${currentFormat.toUpperCase()}`;

    document.getElementById('dropZone').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('sortSection').style.display = 'block';
}

// =============================================================================
// Парсинг данных
// =============================================================================

function parseData(text, format) {
    switch (format) {
        case 'json': return JSON.parse(text);
        case 'csv': return parseCSV(text);
        case 'xml': return parseXML(text);
        default: throw new Error('Неизвестный формат');
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            let val = values[j] || '';
            if (!isNaN(val) && val !== '') {
                val = parseFloat(val);
            }
            obj[headers[j]] = val;
        }
        result.push(obj);
    }

    return result;
}

function parseXML(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    const items = doc.querySelectorAll('item, record, row, entry');
    const nodes = items.length ? items : doc.documentElement.children;

    return Array.from(nodes).map(node => {
        const obj = {};
        Array.from(node.children).forEach(child => {
            let val = child.textContent.trim();
            if (!isNaN(val) && val !== '') {
                val = parseFloat(val);
            }
            obj[child.tagName] = val;
        });
        return obj;
    });
}

// =============================================================================
// Сортировка
// =============================================================================

function setupEventListeners() {
    const removeFile = document.getElementById('removeFile');
    const sortBtn = document.getElementById('sortBtn');

    if (removeFile) removeFile.addEventListener('click', resetAll);
    if (sortBtn) sortBtn.addEventListener('click', performSort);
}

function performSort() {
    const field = document.getElementById('sortField')?.value;
    const order = document.getElementById('sortOrder')?.value;

    if (!field) {
        showToast('Выберите поле для сортировки', 'warning');
        return;
    }

    showLoading('Сортировка данных...');

    try {
        resultData = [...originalData].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'desc' ? bVal - aVal : aVal - bVal;
            }

            const aStr = String(aVal);
            const bStr = String(bVal);

            return order === 'desc'
                ? bStr.localeCompare(aStr)
                : aStr.localeCompare(bStr);
        });

        showResultData();
        hideLoading();
        showToast(`Отсортировано: ${resultData.length} записей`, 'success');

    } catch (error) {
        hideLoading();
        showToast('Ошибка сортировки: ' + error.message, 'error');
    }
}

// =============================================================================
// Отображение данных
// =============================================================================

function populateFields(data) {
    if (!data || !data.length) return;

    const fields = Object.keys(data[0]);
    const sortField = document.getElementById('sortField');

    if (!sortField) return;

    sortField.innerHTML = '<option value="">Выберите поле</option>';

    fields.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        sortField.appendChild(opt);
    });
}

function showOriginalData() {
    const section = document.getElementById('resultsSection');
    if (!section) return;

    section.style.display = 'block';

    const PREVIEW_LIMIT = 100;
    const isLarge = originalData.length > PREVIEW_LIMIT;

    let content = JSON.stringify(
        isLarge ? originalData.slice(0, PREVIEW_LIMIT) : originalData,
        null,
        2
    );

    if (isLarge) {
        content += `\n\n... ещё ${originalData.length - PREVIEW_LIMIT} записей`;
    }

    document.getElementById('originalContent').textContent = content;
}

function showResultData() {
    if (!resultData) return;

    const PREVIEW_LIMIT = 100;
    const isLarge = resultData.length > PREVIEW_LIMIT;

    let content = JSON.stringify(
        isLarge ? resultData.slice(0, PREVIEW_LIMIT) : resultData,
        null,
        2
    );

    if (isLarge) {
        content += `\n\n... ещё ${resultData.length - PREVIEW_LIMIT} записей`;
    }

    const el = document.getElementById('resultContent');
    if (el) el.textContent = content;
}

// =============================================================================
// Утилиты
// =============================================================================

function resetAll() {
    originalData = null;
    resultData = null;
    currentFormat = null;

    document.getElementById('dropZone').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('sortSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('fileInput').value = '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function showLoading(text) {
    const el = document.getElementById('loadingText');
    if (el) el.textContent = text || 'Загрузка...';

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}
