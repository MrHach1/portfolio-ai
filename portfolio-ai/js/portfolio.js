/**
 * Основной скрипт для страницы портфолио
 * Обрабатывает отображение данных и генерацию PDF
 */

// Данные портфолио (в реальном проекте будут загружаться с сервера)
const portfolioData = {
    studentName: "Завадовский Степан Алексеевич",
    aboutText: "Ученик 10 'Б' класса средней общеобразовательной школы № 9 г. Холмска. Активно участвую в олимпиадах и научных проектах.",
    documents: [
        {
            id: 1,
            title: "Диплом победителя олимпиады по математике",
            date: "15.05.2024",
            description: "Первое место в муниципальном этапе всероссийской олимпиады школьников",
            category: "education",
            image: "../assets/sample-certificate1.jpg"
        },
        {
            id: 2,
            title: "Сертификат участника научной конференции",
            date: "22.03.2024",
            description: "Участие в конференции 'Молодые исследователи' с проектом по ИИ",
            category: "science",
            image: "../assets/sample-certificate2.jpg"
        },
        {
            id: 3,
            title: "Грамота за спортивные достижения",
            date: "10.12.2023",
            description: "Второе место в соревнованиях по баскетболу среди школ города",
            category: "sports",
            image: "../assets/sample-certificate3.jpg"
        },
        {
            id: 4,
            title: "Сертификат об окончании курсов",
            date: "05.09.2023",
            description: "Курсы по основам программирования на Python",
            category: "education",
            image: "../assets/sample-certificate4.jpg"
        }
    ]
};

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    // Заполняем основную информацию
    document.getElementById('studentName').textContent = portfolioData.studentName;
    document.getElementById('aboutText').textContent = portfolioData.aboutText;
    
    // Устанавливаем текущую дату
    document.getElementById('generationDate').textContent = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Распределяем документы по категориям
    organizeDocuments();

    // Настройка кнопок
    setupButtons();

    // Применяем выбранную тему оформления
    applyTheme();
});

/**
 * Распределяет документы по соответствующим разделам
 */
function organizeDocuments() {
    const categories = {
        education: document.getElementById('educationDocs'),
        achievements: document.getElementById('achievementsDocs'),
        projects: document.getElementById('projectsDocs'),
        other: document.getElementById('otherDocs')
    };

    // Очищаем все разделы перед заполнением
    Object.values(categories).forEach(section => {
        section.innerHTML = '';
    });

    portfolioData.documents.forEach(doc => {
        const card = createDocumentCard(doc);
        const targetSection = getTargetSection(doc.category);
        
        if (targetSection && card) {
            targetSection.appendChild(card);
        }
    });

    // Показываем сообщения, если разделы пустые
    checkEmptySections();
}

/**
 * Определяет целевой раздел для документа
 */
function getTargetSection(category) {
    const sectionMap = {
        'education': 'education',
        'science': 'projects',
        'sports': 'achievements',
        'creative': 'achievements'
    };
    
    const sectionId = sectionMap[category] || 'other';
    return document.getElementById(sectionId + 'Docs');
}

/**
 * Проверяет пустые разделы и показывает сообщения
 */
function checkEmptySections() {
    const sections = [
        'educationDocs',
        'achievementsDocs',
        'projectsDocs',
        'otherDocs'
    ];
    
    sections.forEach(sectionId => {

const section = document.getElementById(sectionId);
        if (section && section.children.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = 'Нет документов в этом разделе';
            section.appendChild(emptyMsg);
        }
    });
}

/**
 * Настраивает обработчики кнопок
 */
function setupButtons() {
    // Кнопка генерации PDF
    document.getElementById('downloadPdfBtn').addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = '<span class="icon">⏳</span> Генерация PDF...';
        
        if (typeof jsPDF === 'undefined') {
            loadJsPDF().then(generatePDF).finally(() => {
                this.disabled = false;
                this.innerHTML = '<span class="icon">📄</span> Скачать PDF';
            });
        } else {
            generatePDF();
            this.disabled = false;
            this.innerHTML = '<span class="icon">📄</span> Скачать PDF';
        }
    });

    // Кнопка печати
    document.getElementById('printPortfolioBtn').addEventListener('click', function() {
        window.print();
    });

    // Кнопки сворачивания разделов
    document.querySelectorAll('.section-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionId = this.getAttribute('aria-controls');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const section = document.getElementById(sectionId);
            
            if (section) {
                section.style.display = isExpanded ? 'none' : 'grid';
                this.setAttribute('aria-expanded', String(!isExpanded));
                this.textContent = isExpanded ? 'Развернуть' : 'Свернуть';
            }
        });
    });
}

/**
 * Загружает библиотеку jsPDF
 */
function loadJsPDF() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Применяет выбранную тему оформления
 */
function applyTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme') || 'modern';
    document.querySelector('.portfolio-container').classList.add(theme + '-theme');
}

/**
 * Создает карточку документа
 */
function createDocumentCard(doc) {
    if (!doc) return null;
    
    const card = document.createElement('article');
    card.className = 'document-card';
    card.setAttribute('aria-labelledby', `doc-title-${doc.id}`);
    
    const image = document.createElement('img');
    image.src = doc.image;
    image.alt = '';
    image.className = 'document-image';
    image.loading = 'lazy';
    
    const info = document.createElement('div');
    info.className = 'document-info';
    
    const title = document.createElement('h3');
    title.className = 'document-title';
    title.id = `doc-title-${doc.id}`;
    title.textContent = doc.title;
    
    const meta = document.createElement('div');
    meta.className = 'document-meta';
    
    const date = document.createElement('time');
    date.className = 'document-date';
    date.dateTime = formatISODate(doc.date);
    date.textContent = doc.date;
    
    const category = document.createElement('span');
    category.className = 'document-category';
    category.textContent = getCategoryName(doc.category);
    
    meta.appendChild(date);
    meta.appendChild(category);
    
    const desc = document.createElement('p');
    desc.className = 'document-desc';
    desc.textContent = doc.description;
    
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(desc);
    
    card.appendChild(image);
    card.appendChild(info);
    
    return card;
}

/**
 * Форматирует дату в ISO формат
 */
function formatISODate(dateString) {
    const parts = dateString.split('.');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
}

/**
 * Возвращает читаемое название категории
 */
function getCategoryName(category) {
    const names = {
        'education': 'Образование',
        'science': 'Наука',
        'sports': 'Спорт',
        'creative': 'Творчество'
    };
    return names[category] || 'Другое';
}

/**
 * Генерирует PDF с портфолио
 */
function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Настройки документа
        doc.setFont('helvetica');
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        
        // Заголовок
        doc.text('Портфолио: ' + portfolioData.studentName, 105, 20, { align: 'center' });
        
        // Информация "О себе"
        doc.setFontSize(12);
        const aboutLines = doc.splitTextToSize(portfolioData.aboutText, 180);
        doc.text(aboutLines, 15, 40);
        
        // Добавляем документы
        let yPosition = 70;
        portfolioData.documents.forEach((docItem, index) => {
            if (yPosition > 260) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Заголовок документа
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(docItem.title, 15, yPosition);
            
            // Мета-информация
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Дата: ${docItem.date} | Категория: ${getCategoryName(docItem.category)}`, 15, yPosition + 7);
            
            // Описание
            const descLines = doc.splitTextToSize(docItem.description, 180);
            doc.text(descLines, 15, yPosition + 14);
            
            // Разделитель
            if (index < portfolioData.documents.length - 1) {
                doc.line(15, yPosition + 7 + (descLines.length * 5) + 5, 195, yPosition + 7 + (descLines.length * 5) + 5);
            }
            
            yPosition += 20 + (descLines.length * 5);
        });
        
        // Сохраняем PDF
        const fileName = `портфолио_${portfolioData.studentName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
        alert('Не удалось сгенерировать PDF. Пожалуйста, попробуйте позже.');
    }
}