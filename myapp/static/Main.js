/**
 * DataSort Pro — Frontend Logic
 * Универсальный сортировщик данных
 * 
 * @author DataSort Team
 * @version 1.0.0
 */

// =============================================================================
// Состояние приложения
// =============================================================================

let originalData = null;      // Исходные загруженные данные
let resultData = null;        // Результат обработки (сортировка/конвертация)
let currentFormat = null;     // Формат загруженного файла (json/csv/xml)
let targetFormat = null;      // Целевой формат для конвертации
let currentFileName = null;   // Имя загруженного файла
let fileHistory = [];         // История загруженных файлов

// =============================================================================
// Инициализация
// =============================================================================

/**
 * Инициализация приложения после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', function () {
    // Загружаем историю из localStorage
    try {
        fileHistory = JSON.parse(localStorage.getItem('fileHistory') || '[]');
    } catch (e) {
        fileHistory = [];
    }

    init();
});

/**
 * Основная инициализация — настройка обработчиков событий
 */
function init() {
    setupDropZone();
    setupNavigation();
    setupEventListeners();
    renderHistory();
}

// =============================================================================
// Drag & Drop зона загрузки
// =============================================================================

/**
 * Настройка зоны перетаскивания файлов
 */
function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    // Клик по зоне открывает диалог выбора файла
    dropZone.addEventListener('click', () => fileInput.click());

    // Визуальная обратная связь при перетаскивании
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // Обработка сброшенного файла
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Обработка выбора файла через диалог
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });
}

// =============================================================================
// Навигация
// =============================================================================

/**
 * Настройка навигации между разделами
 */
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Обновляем активный пункт меню
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const section = item.dataset.section;

            // Получаем секции
            const sortSection = document.getElementById('sortSection');
            const convertSection = document.getElementById('convertSection');
            const historySection = document.getElementById('historySection');

            // Показываем нужную секцию
            if (sortSection) {
                sortSection.style.display = section === 'sort' && originalData ? 'block' : 'none';
            }
            if (convertSection) {
                convertSection.style.display = section === 'convert' && originalData ? 'block' : 'none';
            }
            if (historySection) {
                historySection.style.display = section === 'history' ? 'block' : 'none';
            }

            // Обновляем историю при переходе в раздел
            if (section === 'history') {
                renderHistory();
            }
        });
    });
}

// =============================================================================
// Обработчики событий
// =============================================================================

/**
 * Настройка всех обработчиков событий
 */
function setupEventListeners() {
    // Кнопки управления файлом
    const removeFile = document.getElementById('removeFile');
    const sortBtn = document.getElementById('sortBtn');
    const resetBtn = document.getElementById('resetBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const closeRec = document.getElementById('closeRecommendations');
    const clearHist = document.getElementById('clearHistory');
    const filterToggle = document.getElementById('filterToggle');
    const algorithm = document.getElementById('algorithm');

    if (removeFile) removeFile.addEventListener('click', resetAll);
    if (sortBtn) sortBtn.addEventListener('click', performSort);
    if (resetBtn) resetBtn.addEventListener('click', resetSort);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeAndRecommend);
    if (closeRec) {
        closeRec.addEventListener('click', () => {
            document.getElementById('recommendationsCard').style.display = 'none';
        });
    }
    if (clearHist) clearHist.addEventListener('click', clearHistory);

    // Карточки конвертации
    document.querySelectorAll('.convert-card').forEach(card => {
        card.addEventListener('click', () => {
            performConvert(card.dataset.from, card.dataset.to);
        });
    });

    // Скачивание конвертированного файла
    const downloadConverted = document.getElementById('downloadConverted');
    if (downloadConverted) {
        downloadConverted.addEventListener('click', () => {
            if (resultData && targetFormat) {
                downloadFile(resultData, 'converted', targetFormat);
            }
        });
    }

    // Переключатель фильтра
    if (filterToggle) {
        filterToggle.addEventListener('click', function () {
            const body = document.getElementById('filterBody');
            if (body) {
                this.classList.toggle('active');
                body.style.display = body.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // Показ второго поля для алгоритмов с зависимостями
    if (algorithm) {
        algorithm.addEventListener('change', function () {
            const needsSecond = ['direct', 'inverse', 'proportional', 'correlation', 'weighted'].includes(this.value);
            const group = document.getElementById('secondFieldGroup');
            if (group) {
                group.style.display = needsSecond ? 'block' : 'none';
            }
        });
    }

    // Кнопки копирования и скачивания
    const copyOrig = document.getElementById('copyOriginal');
    const copyRes = document.getElementById('copyResult');
    const dlOrig = document.getElementById('downloadOriginal');
    const dlRes = document.getElementById('downloadResult');

    if (copyOrig) {
        copyOrig.addEventListener('click', () => {
            copyToClipboard(formatData(originalData, currentFormat));
        });
    }
    if (copyRes) {
        copyRes.addEventListener('click', () => {
            const content = document.getElementById('resultContent');
            copyToClipboard(content ? content.textContent : '');
        });
    }
    if (dlOrig) {
        dlOrig.addEventListener('click', () => {
            downloadFile(originalData, 'original', currentFormat);
        });
    }
    if (dlRes) {
        dlRes.addEventListener('click', () => {
            downloadFile(resultData, 'result', targetFormat || currentFormat);
        });
    }
}


// =============================================================================
// Обработка файлов
// =============================================================================

/**
 * Обработка загруженного файла
 * @param {File} file - загруженный файл
 */
async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    // Проверяем поддерживаемые форматы
    if (!['json', 'csv', 'xml'].includes(ext)) {
        showToast('Неподдерживаемый формат. Используйте JSON, CSV или XML', 'error');
        return;
    }

    showLoading('Загрузка файла...');

    try {
        const text = await file.text();
        originalData = parseData(text, ext);
        currentFormat = ext;
        currentFileName = file.name;

        // Сохраняем в историю
        addToHistory(file.name, ext, file.size, originalData.length);

        // Обновляем UI
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileMeta').textContent =
            `${formatFileSize(file.size)} • ${originalData.length} записей • ${ext.toUpperCase()}`;

        document.getElementById('dropZone').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('sortSection').style.display = 'block';

        // Заполняем выпадающие списки полей
        populateFields(originalData);
        updateConvertCards();
        showOriginalData();

        hideLoading();
        showToast('Файл успешно загружен', 'success');

    } catch (error) {
        hideLoading();
        showToast('Ошибка чтения файла: ' + error.message, 'error');
    }
}

// =============================================================================
// Парсинг данных
// =============================================================================

/**
 * Парсинг данных в зависимости от формата
 * @param {string} text - содержимое файла
 * @param {string} format - формат файла (json/csv/xml)
 * @returns {Array} массив объектов
 */
function parseData(text, format) {
    switch (format) {
        case 'json': return JSON.parse(text);
        case 'csv': return parseCSV(text);
        case 'xml': return parseXML(text);
        default: throw new Error('Неизвестный формат');
    }
}

/**
 * Парсинг CSV файла
 * @param {string} text - содержимое CSV
 * @returns {Array} массив объектов
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Первая строка — заголовки
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    // Парсим остальные строки
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            let val = values[j] || '';
            // Пробуем преобразовать в число
            if (!isNaN(val) && val !== '') {
                val = parseFloat(val);
            }
            obj[headers[j]] = val;
        }
        result.push(obj);
    }

    return result;
}

/**
 * Парсинг одной строки CSV с учётом кавычек
 * @param {string} line - строка CSV
 * @returns {Array} массив значений
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

/**
 * Парсинг XML файла
 * @param {string} text - содержимое XML
 * @returns {Array} массив объектов
 */
function parseXML(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    // Ищем элементы данных
    const items = doc.querySelectorAll('item, record, row, entry');
    const nodes = items.length ? items : doc.documentElement.children;

    return Array.from(nodes).map(node => {
        const obj = {};
        Array.from(node.children).forEach(child => {
            let val = child.textContent.trim();
            // Пробуем преобразовать в число
            if (!isNaN(val) && val !== '') {
                val = parseFloat(val);
            }
            obj[child.tagName] = val;
        });
        return obj;
    });
}

// =============================================================================
// Форматирование данных
// =============================================================================

/**
 * Форматирование данных для отображения/скачивания
 * @param {Array} data - массив данных
 * @param {string} format - целевой формат
 * @param {number} limit - ограничение количества записей (для превью)
 * @returns {string} отформатированные данные
 */
function formatData(data, format, limit = null) {
    if (!data) return '';

    const d = limit ? data.slice(0, limit) : data;

    switch (format) {
        case 'json': return JSON.stringify(d, null, 2);
        case 'csv': return dataToCSV(d);
        case 'xml': return dataToXML(d);
        default: return JSON.stringify(d, null, 2);
    }
}

/**
 * Конвертация в CSV
 */
function dataToCSV(data) {
    if (!data || !data.length) return '';

    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];

    for (const item of data) {
        const vals = headers.map(h => {
            let v = item[h] ?? '';
            if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) {
                v = '"' + v.replace(/"/g, '""') + '"';
            }
            return v;
        });
        lines.push(vals.join(','));
    }

    return lines.join('\n');
}

/**
 * Конвертация в XML
 */
function dataToXML(data) {
    if (!data || !data.length) {
        return '<?xml version="1.0"?>\n<data></data>';
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    for (const item of data) {
        xml += '  <item>\n';
        for (const [k, v] of Object.entries(item)) {
            const escaped = String(v ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            xml += `    <${k}>${escaped}</${k}>\n`;
        }
        xml += '  </item>\n';
    }

    return xml + '</data>';
}

/**
 * Заполнение выпадающих списков полями из данных
 */
function populateFields(data) {
    if (!data || !data.length) return;

    const fields = Object.keys(data[0]);

    ['sortField', 'secondField', 'filterField'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;

        const firstOption = sel.options[0];
        sel.innerHTML = '';
        sel.appendChild(firstOption);

        fields.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            sel.appendChild(opt);
        });
    });
}

/**
 * Обновление доступности карточек конвертации
 */
function updateConvertCards() {
    document.querySelectorAll('.convert-card').forEach(card => {
        const isDisabled = currentFormat && currentFormat !== card.dataset.from;
        card.classList.toggle('disabled', isDisabled);
    });
}

/**
 * Отображение исходных данных
 */
function showOriginalData() {
    const section = document.getElementById('resultsSection');
    if (!section) return;

    section.style.display = 'block';

    // Ограничиваем превью для больших файлов
    const PREVIEW_LIMIT = 100;
    const isLarge = originalData.length > PREVIEW_LIMIT;

    let content = formatData(originalData, currentFormat, isLarge ? PREVIEW_LIMIT : null);
    if (isLarge) {
        content += `\n\n... ещё ${originalData.length - PREVIEW_LIMIT} записей`;
    }

    document.getElementById('originalContent').textContent = content;
    document.getElementById('originalStats').innerHTML =
        `<span>${originalData.length} записей</span>` +
        `<span>${Object.keys(originalData[0] || {}).length} полей</span>`;
}


// =============================================================================
// Сортировка
// =============================================================================

/**
 * Выполнение сортировки через API
 */
async function performSort() {
    const field = document.getElementById('sortField')?.value;
    const order = document.getElementById('sortOrder')?.value;
    const algo = document.getElementById('algorithm')?.value;
    const second = document.getElementById('secondField')?.value;

    // Валидация
    if (!field) {
        showToast('Выберите поле для сортировки', 'warning');
        return;
    }

    // Проверка второго поля для алгоритмов с зависимостями
    const needsSecondField = ['direct', 'inverse', 'proportional', 'correlation', 'weighted'];
    if (needsSecondField.includes(algo) && !second) {
        showToast('Выберите второе поле для этого алгоритма', 'warning');
        return;
    }

    showLoading('Сортировка данных...');

    try {
        const response = await fetch('/sort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                json_data: originalData,
                sort_field: field,
                reverse_sort: order === 'desc' ? 'yes' : 'no',
                algorithm: algo,
                second_field: second
            })
        });

        const result = await response.json();
        hideLoading();

        if (result.status === 'success') {
            resultData = result.sorted_data;
            targetFormat = currentFormat;
            showResultData();
            showToast(`Отсортировано: ${resultData.length} записей`, 'success');
        } else {
            showToast(result.message || 'Ошибка сортировки', 'error');
        }

    } catch (error) {
        hideLoading();
        showToast('Ошибка: ' + error.message, 'error');
    }
}

/**
 * Отображение результата сортировки
 */
function showResultData() {
    if (!resultData) return;

    const PREVIEW_LIMIT = 100;
    const isLarge = resultData.length > PREVIEW_LIMIT;

    let content = formatData(resultData, targetFormat || currentFormat, isLarge ? PREVIEW_LIMIT : null);
    if (isLarge) {
        content += `\n\n... ещё ${resultData.length - PREVIEW_LIMIT} записей`;
    }

    const el = document.getElementById('resultContent');
    if (el) el.textContent = content;

    const stats = document.getElementById('resultStats');
    if (stats) stats.innerHTML = `<span>${resultData.length} записей</span>`;
}

/**
 * Сброс параметров сортировки
 */
function resetSort() {
    ['sortField', 'sortOrder', 'algorithm', 'secondField', 'filterField'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });

    const filterValue = document.getElementById('filterValue');
    if (filterValue) filterValue.value = '';

    const secondGroup = document.getElementById('secondFieldGroup');
    if (secondGroup) secondGroup.style.display = 'none';
}

// =============================================================================
// Конвертация
// =============================================================================

/**
 * Выполнение конвертации формата
 * @param {string} from - исходный формат
 * @param {string} to - целевой формат
 */
function performConvert(from, to) {
    if (!originalData) {
        showToast('Сначала загрузите файл', 'warning');
        return;
    }

    if (currentFormat !== from) {
        showToast(`Для этой конвертации нужен ${from.toUpperCase()} файл`, 'warning');
        return;
    }

    showLoading('Конвертация...');

    // Используем setTimeout для обновления UI перед тяжёлой операцией
    setTimeout(() => {
        targetFormat = to;
        resultData = originalData;

        const PREVIEW_LIMIT = 100;
        const isLarge = resultData.length > PREVIEW_LIMIT;

        let content = formatData(resultData, to, isLarge ? PREVIEW_LIMIT : null);
        if (isLarge) {
            content += `\n\n... ещё ${resultData.length - PREVIEW_LIMIT} записей`;
        }

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultContent').textContent = content;
        document.getElementById('resultStats').innerHTML =
            `<span>${resultData.length} записей</span><span>${to.toUpperCase()}</span>`;

        // Показываем статус конвертации
        const status = document.getElementById('convertStatus');
        if (status) {
            document.getElementById('convertStatusDesc').textContent =
                `${from.toUpperCase()} → ${to.toUpperCase()}`;
            status.style.display = 'flex';
        }

        hideLoading();
        showToast(`Конвертировано в ${to.toUpperCase()}`, 'success');
    }, 50);
}

// =============================================================================
// Сброс и утилиты
// =============================================================================

/**
 * Полный сброс приложения
 */
function resetAll() {
    originalData = null;
    resultData = null;
    currentFormat = null;
    targetFormat = null;

    document.getElementById('dropZone').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('sortSection').style.display = 'none';
    document.getElementById('convertSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('fileInput').value = '';

    const status = document.getElementById('convertStatus');
    if (status) status.style.display = 'none';

    document.querySelectorAll('.convert-card').forEach(c => c.classList.remove('disabled'));
    resetSort();
}

/**
 * Форматирование размера файла
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Копирование в буфер обмена
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Скопировано в буфер обмена', 'success'))
        .catch(() => showToast('Ошибка копирования', 'error'));
}

/**
 * Скачивание файла
 */
function downloadFile(data, prefix, format) {
    if (!data) return;

    showLoading('Подготовка файла...');

    setTimeout(() => {
        const content = formatData(data, format);
        const mimeTypes = {
            json: 'application/json',
            csv: 'text/csv',
            xml: 'application/xml'
        };

        const blob = new Blob([content], { type: mimeTypes[format] || 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefix}.${format}`;
        a.click();

        URL.revokeObjectURL(url);
        hideLoading();
        showToast('Файл скачан', 'success');
    }, 50);
}

/**
 * Показать индикатор загрузки
 */
function showLoading(text) {
    const el = document.getElementById('loadingText');
    if (el) el.textContent = text || 'Загрузка...';

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

/**
 * Скрыть индикатор загрузки
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

/**
 * Показать уведомление
 */
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

    // Автоматическое удаление через 3 секунды
    setTimeout(() => toast.remove(), 3000);
}


// =============================================================================
// История загрузок
// =============================================================================

/**
 * Добавление записи в историю
 */
function addToHistory(name, format, size, records) {
    // Удаляем дубликат если есть
    fileHistory = fileHistory.filter(h => h.name !== name);

    // Добавляем в начало
    fileHistory.unshift({
        id: Date.now(),
        name,
        format,
        size,
        records,
        date: new Date().toLocaleString('ru-RU')
    });

    // Ограничиваем историю 10 записями
    if (fileHistory.length > 10) {
        fileHistory = fileHistory.slice(0, 10);
    }

    // Сохраняем в localStorage
    try {
        localStorage.setItem('fileHistory', JSON.stringify(fileHistory));
    } catch (e) {
        console.warn('Не удалось сохранить историю:', e);
    }
}

/**
 * Отрисовка списка истории
 */
function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    if (!fileHistory.length) {
        list.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <p>История пуста</p>
            </div>
        `;
        return;
    }

    list.innerHTML = fileHistory.map(h => `
        <div class="history-item">
            <div class="history-icon ${h.format}">${h.format.toUpperCase()}</div>
            <div class="history-info">
                <div class="history-name">${h.name}</div>
                <div class="history-meta">
                    ${h.records} записей • ${formatFileSize(h.size)} • ${h.date}
                </div>
            </div>
            <button class="btn-icon" onclick="deleteHistory(${h.id})" title="Удалить">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

/**
 * Удаление записи из истории
 */
function deleteHistory(id) {
    fileHistory = fileHistory.filter(h => h.id !== id);

    try {
        localStorage.setItem('fileHistory', JSON.stringify(fileHistory));
    } catch (e) {
        console.warn('Не удалось сохранить историю:', e);
    }

    renderHistory();
}

/**
 * Очистка всей истории
 */
function clearHistory() {
    fileHistory = [];

    try {
        localStorage.setItem('fileHistory', '[]');
    } catch (e) {
        console.warn('Не удалось очистить историю:', e);
    }

    renderHistory();
    showToast('История очищена', 'success');
}

// =============================================================================
// Рекомендации параметров сортировки
// =============================================================================

/**
 * Анализ данных и генерация рекомендаций
 */
function analyzeAndRecommend() {
    if (!originalData || !originalData.length) {
        showToast('Сначала загрузите данные', 'warning');
        return;
    }

    const fields = Object.keys(originalData[0]);

    // Находим числовые поля
    const numericFields = fields.filter(f => typeof originalData[0][f] === 'number');

    // Генерируем рекомендации
    const recommendations = [];

    if (numericFields.length > 0) {
        recommendations.push({
            icon: 'fa-sort-numeric-down',
            title: `Сортировка по "${numericFields[0]}"`,
            field: numericFields[0],
            algo: 'standard'
        });
    }

    if (numericFields.length >= 2) {
        recommendations.push({
            icon: 'fa-chart-line',
            title: `Корреляция: ${numericFields[0]} и ${numericFields[1]}`,
            field: numericFields[0],
            second: numericFields[1],
            algo: 'correlation'
        });
    }

    // Отображаем рекомендации
    const body = document.getElementById('recommendationsBody');
    const card = document.getElementById('recommendationsCard');

    if (!body || !card) return;

    body.innerHTML = recommendations.map(r => `
        <div class="recommendation-item">
            <div class="rec-icon"><i class="fas ${r.icon}"></i></div>
            <div class="rec-content">
                <div class="rec-title">${r.title}</div>
            </div>
            <button class="rec-apply" onclick="applyRecommendation('${r.field}', '${r.algo}', '${r.second || ''}')">
                Применить
            </button>
        </div>
    `).join('');

    card.style.display = 'block';
    showToast('Рекомендации готовы', 'success');
}

/**
 * Применение рекомендации
 */
function applyRecommendation(field, algo, second) {
    const sortField = document.getElementById('sortField');
    const algorithm = document.getElementById('algorithm');
    const secondField = document.getElementById('secondField');
    const secondGroup = document.getElementById('secondFieldGroup');

    if (sortField) sortField.value = field;
    if (algorithm) algorithm.value = algo;

    if (second && secondField) {
        secondField.value = second;
        if (secondGroup) secondGroup.style.display = 'block';
    }

    showToast('Параметры применены, запуск сортировки...', 'success');

    // Автоматически запускаем сортировку
    setTimeout(() => performSort(), 500);
}