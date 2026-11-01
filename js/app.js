// 1. إعدادات الـ API والمتغيرات الأساسية
const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let tajweedData = {}; 

// 2. محرك معالجة التجويد الخاص بك (TajweedProcessor)
const TajweedProcessor = {
    labels: {
        "qalqalah_sughra": "القلقلة الصغرى",
        "qalqalah_kubra": "القلقلة الكبرى",
        "madd_tabiee": "المد الطبيعي",
        "madd_muttasil": "المد المتصل",
        "madd_munfasil": "المد المنفصل",
        "hams": "الهمس",
        "tafkheem_ra": "تفخيم الراء",
        "tarqeeq_ra": "ترقيق الراء",
        "ghunnah": "الغنة",
        "ikhfa": "إخفاء",
        "idgham": "إدغام",
        "izhar": "إظهار",
        "iqlab": "إقلاب"
    },

    renderWordHTML(wordText, wordRules) {
        if (!wordRules || wordRules.length === 0) {
            return `<span>${wordText}</span>`;
        }

        const characters = Array.from(wordText);
        const charClasses = new Array(characters.length).fill(null).map(() => []);
        const charTooltips = new Array(characters.length).fill(null).map(() => []);

        wordRules.forEach(rule => {
            const ruleClass = `tajweed-${rule.type}`;
            const ruleLabel = this.labels[rule.type] || rule.type;

            rule.chars.forEach(charIndex => {
                if (charIndex < characters.length) {
                    charClasses[charIndex].push(ruleClass);
                    charTooltips[charIndex].push(ruleLabel);
                }
            });
        });

        let htmlOutput = "";
        let currentClasses = "";
        let currentGroupText = "";
        let currentTooltip = "";

        for (let i = 0; i < characters.length; i++) {
            const classesForChar = charClasses[i].join(" ");
            const tooltipForChar = charTooltips[i].join(" و "); 

            if (classesForChar !== currentClasses) {
                if (currentGroupText !== "") {
                    htmlOutput += currentClasses 
                        ? `<span class="${currentClasses}" title="${currentTooltip}">${currentGroupText}</span>`
                        : `<span>${currentGroupText}</span>`;
                }
                currentClasses = classesForChar;
                currentTooltip = tooltipForChar;
                currentGroupText = characters[i];
            } else {
                currentGroupText += characters[i];
            }
        }

        if (currentGroupText !== "") {
            htmlOutput += currentClasses 
                ? `<span class="${currentClasses}" title="${currentTooltip}">${currentGroupText}</span>`
                : `<span>${currentGroupText}</span>`;
        }

        return htmlOutput;
    }
};

// 3. دوال التشغيل وجلب البيانات من الـ API
const quranContainer = document.getElementById('quranContainer'); // تأكد أن الـ ID يطابق الـ HTML الخاص بك

async function init() {
    await loadSurah(currentSurah);
}

async function loadSurah(surahId) {
    quranContainer.innerHTML = '<div class="text-center mt-10">جاري تحميل السورة...</div>';
    
    try {
        await loadTajweedData(surahId); 
        const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${surahId}?language=ar&words=true&word_fields=text_uthmani,line_number,page_number&per_page=300`);
        const data = await response.json();
        renderMushaf(data.verses);
    } catch (error) {
        quranContainer.innerHTML = '<div class="text-red-500 text-center mt-10">حدث خطأ أثناء تحميل الآيات.</div>';
    }
}

async function loadTajweedData(surahId) {
    try {
        // تأكد من مسار ملف الـ JSON الخاص بك
        const response = await fetch(`./data/tajweed_db_final/surah_${surahId}.json`);
        if (!response.ok) {
            tajweedData = {};
            return;
        }
        tajweedData = await response.json();
    } catch (error) {
        tajweedData = {};
    }
}

// 4. رسم المصحف باستخدام الـ TajweedProcessor
function renderMushaf(verses) {
    quranContainer.innerHTML = '';
    const pages = {};
    
    // تجميع الكلمات بالصفحات والأسطر
    verses.forEach(verse => {
        verse.words.forEach(word => {
            if (!word.text_uthmani && word.char_type_name !== 'end') return;
            const p = word.page_number;
            const l = word.line_number;
            if (!pages[p]) pages[p] = {};
            if (!pages[p][l]) pages[p][l] = [];
            pages[p][l].push({ word, verse });
        });
    });

    Object.keys(pages).forEach((pageNum) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'quran-page mb-10';

        const lines = pages[pageNum];
        Object.keys(lines).forEach((lineNum) => {
            const lineElements = lines[lineNum];
            const lineDiv = document.createElement('div');
            lineDiv.className = 'flex flex-wrap items-center justify-between w-full min-h-[3.5rem] leading-none mb-1';

            lineElements.forEach(({ word, verse }) => {
                const span = document.createElement('span');
                span.className = 'word-token mx-1 cursor-pointer';
                
                if (word.char_type_name === 'end') {
                    const arabicNumber = verse.verse_number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
                    span.innerHTML = `<span class="text-gold-500 mx-2">﴿${arabicNumber}﴾</span>`;
                } else {
                    const wordKey = `${currentSurah}:${verse.verse_number}:${word.position}`;
                    span.dataset.key = wordKey;
                    
                    // استدعاء دالتك الجديدة لمعالجة الكلمة
                    const rules = tajweedData[wordKey] || [];
                    span.innerHTML = TajweedProcessor.renderWordHTML(word.text_uthmani, rules);
                }
                lineDiv.appendChild(span);
            });
            pageDiv.appendChild(lineDiv);
        });
        quranContainer.appendChild(pageDiv);
    });
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);
