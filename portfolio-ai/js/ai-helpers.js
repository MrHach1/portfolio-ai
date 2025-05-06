/**
 * Модуль для имитации обработки документов искусственным интеллектом
 * В школьном проекте используем упрощенные алгоритмы вместо реального ИИ
 */

// Расширенная база знаний для категоризации
const KNOWLEDGE_BASE = {
    categories: {
        'education': {
            keywords: ['диплом', 'аттестат', 'сертификат', 'курс', 'обучение', 'зачёт', 'образование'],
            description: 'Образовательные документы'
        },
        'achievements': {
            keywords: ['грамота', 'награда', 'благодарность', 'победа', 'победитель', 'лауреат'],
            description: 'Достижения и награды'
        },
        'science': {
            keywords: ['олимпиада', 'конференция', 'исследование', 'проект', 'наука', 'доклад'],
            description: 'Научная деятельность'
        },
        'creative': {
            keywords: ['конкурс', 'выставка', 'рисунок', 'музыка', 'танец', 'поэзия', 'сочинение'],
            description: 'Творческие работы'
        },
        'sports': {
            keywords: ['спорт', 'медаль', 'кубок', 'турнир', 'чемпионат', 'разряд', 'соревнование'],
            description: 'Спортивные достижения'
        }
    },
    descriptions: {
        'диплом': 'Диплом об окончании {учебного заведения/курса}',
        'аттестат': 'Аттестат о среднем образовании с оценками',
        'сертификат': 'Сертификат {участника/победителя} {мероприятия}',
        'грамота': 'Грамота за {достижение} в {области деятельности}',
        'благодарность': 'Благодарность за {вклад/участие}',
        'проект': '{Учебный/Исследовательский} проект на тему "{тема}"',
        'олимпиада': 'Диплом {уровня} олимпиады по {предмету}'
    },
    templates: {
        about: [
            "Я активный учащийся с интересами в {области}.",
            "Мои основные достижения связаны с {области}.",
            "В моем портфолио представлены результаты работы в {области}."
        ],
        categoryStats: {
            education: "имею {count} образовательных документов",
            achievements: "получил {count} наград",
            science: "участвовал в {count} научных мероприятиях",
            creative: "создал {count} творческих работ",
            sports: "достиг успехов в {count} спортивных соревнованиях"
        }
    }
};

// Дополнительные данные для генерации
const SCHOOL_INFO = {
    subjects: ['математике', 'физике', 'информатике', 'биологии', 'химии', 'литературе', 'истории'],
    activities: ['спортивных', 'творческих', 'научных', 'учебных', 'социальных'],
    levels: ['школьных', 'городских', 'региональных', 'всероссийских']
};

/**
 * Категоризация документов с расширенной логикой
 * @param {Array} documents - Массив документов
 * @return {Array} Документы с добавленной категоризацией
 */
function categorizeDocuments(documents) {
    return documents.map(doc => {
        const lowerName = doc.name.toLowerCase();
        let category = 'other';
        let confidence = 0;
        let matchedCategory = null;

        // Поиск наиболее подходящей категории
        for (const [cat, data] of Object.entries(KNOWLEDGE_BASE.categories)) {
            const matches = data.keywords.filter(keyword => lowerName.includes(keyword));
            if (matches.length > 0 && matches.length > confidence) {
                confidence = matches.length;
                matchedCategory = cat;
            }
        }

        // Дополнительная проверка по расширениям файлов
        if (matchedCategory) {
            category = matchedCategory;
        } else if (lowerName.endsWith('.pdf') && lowerName.includes('отчёт')) {
            category = 'science';
        } else if (lowerName.includes('рисун') || lowerName.includes('фото')) {
            category = 'creative';
        }

        return {
            ...doc,
            category,
            categoryDescription: KNOWLEDGE_BASE.categories[category]?.description || 'Разное'
        };
    });
}

/**
 * Генерация описания документа с подстановкой значений
 * @param {string} filename - Имя файла
 * @return {string} Сгенерированное описание
 */
function generateDescription(filename) {
    const lowerName = filename.toLowerCase();
    
    // Поиск точного совпадения
    for (const [key, template] of Object.entries(KNOWLEDGE_BASE.descriptions)) {
        if (lowerName.includes(key)) {
            return fillTemplate(template, filename);
        }
    }
    
    // Общий шаблон для неизвестных типов
    if (lowerName.includes('проект')) {
        return fillTemplate(KNOWLEDGE_BASE.descriptions['проект'], filename);
    }
    if (lowerName.includes('олимпиад')) {
        return fillTemplate(KNOWLEDGE_BASE.descriptions['олимпиада'], filename);
    }
    
    return 'Документ, подтверждающий достижение: ' + filename;
}

/**
 * Заполнение шаблона данными из имени файла
 */
function fillTemplate(template, filename) {
    // Простая реализация - в реальном ИИ было бы сложнее
    return template
        .replace('{учебного заведения/курса}', getRandom(['школы', 'курса', 'программы']))
        .replace('{мероприятия}', getRandom(SCHOOL_INFO.levels) + ' ' + getRandom(['мероприятии', 'конкурсе', 'соревновании']))
        .replace('{тема}', extractTopic(filename))
        .replace('{предмету}', getRandom(SCHOOL_INFO.subjects))
        .replace('{достижение}', getRandom(['первое место', 'успехи', 'активное участие']))
        .replace('{области деятельности}', getRandom(SCHOOL_INFO.subjects.concat(SCHOOL_INFO.activities)));
}

/**
 * Генерация текста "О себе" на основе документов
 */
function generateAboutText(documents, studentName) {
    const stats = documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
    }, {});

    const topCategories = Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([cat]) => cat);

    const template = getRandom(KNOWLEDGE_BASE.templates.about);
    const areas = topCategories.map(cat => 
        KNOWLEDGE_BASE.categories[cat]?.description.toLowerCase() || cat
    ).join(' и ');

    const aboutText = template.replace('{области}', areas);
    
    const statsText = Object.entries(stats)
        .filter(([cat]) => KNOWLEDGE_BASE.templates.categoryStats[cat])
        .map(([cat, count]) => 
            KNOWLEDGE_BASE.templates.categoryStats[cat].replace('{count}', count)
        )
        .join(', ');

    return `${studentName || 'Я'}. ${aboutText} ${statsText}.`;
}

// Вспомогательные функции
function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function extractTopic(filename) {
    const cleanName = filename.replace(/\.[^/.]+$/, ""); // Удаляем расширение
    const words = cleanName.split(/[\s_\-\.]/g).filter(w => w.length > 3);
    return words.length > 2 ? words.slice(1, 3).join(' ') : 'интересная тема';
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        categorizeDocuments,
        generateDescription,
        generateAboutText,
        KNOWLEDGE_BASE
    };
} else {
    // Для использования в браузере
    window.AIHelpers = {
        categorizeDocuments,
        generateDescription,
        generateAboutText
    };
}