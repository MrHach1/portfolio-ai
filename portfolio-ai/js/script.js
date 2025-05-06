/**
 * Основной скрипт для страницы загрузки документов
 * Обрабатывает загрузку файлов и подготовку данных для портфолио
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const filePreviews = document.getElementById('filePreviews');
    const generateBtn = document.getElementById('generateBtn');
    const themeSelect = document.getElementById('portfolioTheme');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const studentNameInput = document.getElementById('studentName');
    const watermarkCheckbox = document.getElementById('includeWatermark');
    const loadingBar = document.getElementById('loadingBar');
    const uploadProgress = document.getElementById('uploadProgress');

    // Максимальные значения
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILES = 10;

    // Инициализация страницы
    initUploadPage();

    // ===== ОСНОВНЫЕ ФУНКЦИИ =====

    function initUploadPage() {
        // Загрузка сохранённых данных
        const savedData = loadFromLocalStorage();
        if (savedData.documents.length > 0) {
            showPreviewArea();
            renderDocuments(savedData.documents);
            if (savedData.studentName) {
                studentNameInput.value = savedData.studentName;
            }
        }

        // Настройка обработчиков событий
        setupDragAndDrop();
        fileInput.addEventListener('change', handleFileSelect);
        generateBtn.addEventListener('click', generatePortfolio);
        clearAllBtn.addEventListener('click', clearAllFiles);
    }

    function setupDragAndDrop() {
        // Предотвращение стандартного поведения
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropArea.addEventListener(event, preventDefaults, false);
        });

        // Подсветка области при перетаскивании
        ['dragenter', 'dragover'].forEach(event => {
            dropArea.addEventListener(event, highlightDropArea, false);
        });

        // Удаление подсветки
        ['dragleave', 'drop'].forEach(event => {
            dropArea.addEventListener(event, unhighlightDropArea, false);
        });

        // Обработка сброса файлов
        dropArea.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlightDropArea() {
        dropArea.classList.add('highlight');
    }

    function unhighlightDropArea() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        processFiles(files);
    }

    function handleFileSelect(e) {
        processFiles(e.target.files);
        // Сброс значения input для возможности повторной загрузки тех же файлов
        e.target.value = '';
    }

    function processFiles(files) {
        if (!files || files.length === 0) return;

        // Проверка количества файлов
        if (files.length > MAX_FILES) {
            showError(`Максимальное количество файлов: ${MAX_FILES}`);
            return;
        }

        showLoading(true);

        // Асинхронная обработка файлов
        setTimeout(() => {
            const validFiles = Array.from(files)
                .filter(file => {
                    // Проверка размера файла
                    if (file.size > MAX_FILE_SIZE) {
                        showError(`Файл "${file.name}" слишком большой (макс. ${formatFileSize(MAX_FILE_SIZE)})`);
                        return false;
                    }
                    // Проверка типа файла

if (!isFileTypeSupported(file.type)) {
                        showError(`Неподдерживаемый формат файла: ${file.name}`);
                        return false;
                    }
                    return true;
                })
                .map(file => ({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    file: file
                }));

            if (validFiles.length > 0) {
                const currentDocuments = loadFromLocalStorage().documents;
                const allDocuments = [...currentDocuments, ...validFiles].slice(0, MAX_FILES);
                
                saveToLocalStorage({
                    documents: allDocuments,
                    studentName: studentNameInput.value.trim()
                });
                
                showPreviewArea();
                renderDocuments(allDocuments);
            }

            showLoading(false);
        }, 500); // Имитация обработки
    }

    function showLoading(show) {
        if (show) {
            loadingBar.classList.remove('hidden');
            uploadProgress.style.width = '0%';
            // Имитация прогресса
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                uploadProgress.style.width = `${progress}%`;
                if (progress >= 90) clearInterval(interval);
            }, 100);
        } else {
            loadingBar.classList.add('hidden');
            uploadProgress.style.width = '100%';
        }
    }

    function showPreviewArea() {
        previewArea.classList.remove('hidden');
        filePreviews.innerHTML = '';
        updateFileCounter();
    }

    function renderDocuments(documents) {
        filePreviews.innerHTML = '';
        
        documents.forEach(doc => {
            const preview = createFilePreview(doc);
            filePreviews.appendChild(preview);
        });
        
        updateFileCounter();
    }

    function createFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.dataset.id = file.id;
        
        const icon = document.createElement('div');
        icon.className = 'file-icon';
        icon.innerHTML = getFileIcon(file.type);
        icon.setAttribute('aria-hidden', 'true');
        
        const info = document.createElement('div');
        info.className = 'file-info';
        
        const name = document.createElement('p');
        name.className = 'file-name';
        name.textContent = truncateFileName(file.name, 25);
        name.title = file.name;
        
        const meta = document.createElement('div');
        meta.className = 'file-meta';
        
        const size = document.createElement('span');
        size.className = 'file-size';
        size.textContent = formatFileSize(file.size);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Удалить файл';
        removeBtn.addEventListener('click', () => removeFile(file.id));
        
        meta.appendChild(size);
        meta.appendChild(removeBtn);
        
        info.appendChild(name);
        info.appendChild(meta);
        preview.appendChild(icon);
        preview.appendChild(info);
        
        return preview;
    }

    function removeFile(fileId) {
        const currentData = loadFromLocalStorage();
        const updatedDocuments = currentData.documents.filter(doc => doc.id !== fileId);
        
        saveToLocalStorage({
            ...currentData,
            documents: updatedDocuments
        });
        
        renderDocuments(updatedDocuments);
        
        if (updatedDocuments.length === 0) {
            previewArea.classList.add('hidden');
        }
    }

function clearAllFiles() {
        if (confirm('Вы уверены, что хотите удалить все загруженные файлы?')) {
            saveToLocalStorage({
                documents: [],
                studentName: studentNameInput.value.trim()
            });
            previewArea.classList.add('hidden');
        }
    }

    function generatePortfolio() {
        const theme = themeSelect.value;
        const studentName = studentNameInput.value.trim() || 'Анонимный пользователь';
        const watermark = watermarkCheckbox.checked;
        
        // Сохраняем текущие данные
        saveToLocalStorage({
            documents: loadFromLocalStorage().documents,
            studentName: studentName
        });
        
        // Показываем индикатор загрузки
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Идет генерация...';
        
        // Имитация обработки ИИ
        setTimeout(() => {
            window.location.href = `portfolio.html?theme=${theme}&name=${encodeURIComponent(studentName)}&watermark=${watermark}`;
        }, 1500);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    function isFileTypeSupported(type) {
        const supportedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        return supportedTypes.some(supportedType => 
            type === supportedType || 
            (type.startsWith('image/') && type !== 'image/svg+xml')
        );
    }

    function getFileIcon(type) {
        const icons = {
            'image/': '🖼',
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'default': '📁'
        };
        
        for (const key in icons) {
            if (type.startsWith(key)) return icons[key];
        }
        return icons['default'];
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 байт';
        
        const units = ['байт', 'КБ', 'МБ', 'ГБ'];
        const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, exponent)).toFixed(exponent ? 1 : 0);
        
        return `${size} ${units[exponent]}`;
    }

    function truncateFileName(name, maxLength) {
        if (name.length <= maxLength) return name;
        
        const extensionIndex = name.lastIndexOf('.');
        if (extensionIndex === -1) return `${name.substring(0, maxLength)}...`;
        
        const namePart = name.substring(0, extensionIndex);
        const extension = name.substring(extensionIndex);
        
        return `${namePart.substring(0, maxLength - extension.length - 3)}...${extension}`;
    }

    function updateFileCounter() {
        const counter = document.getElementById('fileCount');
        if (counter) {
            const count = filePreviews.children.length;
            counter.textContent = `(${count})`;
        }
    }

    // ===== РАБОТА С ЛОКАЛЬНЫМ ХРАНИЛИЩЕМ =====

    function saveToLocalStorage(data) {
        try {
            const saveData = {
                ...data,
                // Не сохраняем объекты File, так как они не сериализуются
                documents: data.documents.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    size: doc.size,
                    type: doc.type,
                    lastModified: doc.lastModified
                }))
            };
            
            localStorage.setItem('portfolioData', JSON.stringify(saveData));
        } catch (e) {
            console.error('Ошибка сохранения данных:', e);
            showError('Не удалось сохранить данные в локальное хранилище');
        }
    }

function loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('portfolioData');
            return data ? JSON.parse(data) : { documents: [], studentName: '' };
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
            showError('Не удалось загрузить сохранённые данные');
            return { documents: [], studentName: '' };
        }
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        
        document.body.insertBefore(errorEl, document.body.firstChild);
        
        setTimeout(() => {
            errorEl.classList.add('fade-out');
            setTimeout(() => errorEl.remove(), 300);
        }, 5000);
    }
});