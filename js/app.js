// 1. API Configuration and State
const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {};

// 2. Tajweed Processor (Text Engine)
const TajweedProcessor = {
    // Maps standard keys to CSS class names and Arabic labels for tooltips
    labels: {
        "madd_lazim_kalimi_muthaqqal": "المد اللازم الكلمي المثقل",
        "madd_lazim_kalimi_mukhaffaf": "المد اللازم الكلمي المخفف",
        "madd_lazim_harfi_muthaqqal": "المد اللازم الحرفي المثقل",
        "madd_lazim_harfi_mukhaffaf": "المد اللازم الحرفي المخفف",
        "madd_muttasil": "المد المتصل",
        "madd_munfasil": "المد المنفصل",
        "madd_silah_kubra": "مد الصلة الكبرى",
        "madd_ared": "المد العارض للسكون",
        "madd_leen": "مد اللين",
        "madd_tabiee": "المد الطبيعي (الأصلي)",
        "madd_silah_sughra": "مد الصلة الصغرى",
        "madd_badal": "مد البدل",
        "madd_iwad": "مد العوض",
        "ikhfa": "الإخفاء الحقيقي",
        "ikhfa_shafawi": "الإخفاء الشفوي",
        "ghunnah": "غنة النون والميم المشددة",
        "iqlab": "الإقلاب",
        "idgham_ghunnah": "الإدغام بغنة",
        "idgham_shafawi": "الإدغام الشفوي",
        "idgham_no_ghunnah": "الإدغام بغير غنة",
        "silent": "تكتب ولا تُلفظ",
        "idhar_halqi": "الإظهار الحلقي",
        "idhar_shafawi": "الإظهار الشفوي",
        "tafkheem_general": "تفخيم الحروف المستعلية",
        "tafkheem_lam": "تفخيم اللام",
        "tafkheem_ra": "تفخيم الراء",
        "tarqeeq_general": "ترقيق الحروف",
        "tarqeeq_lam": "ترقيق اللام",
        "tarqeeq_ra": "ترقيق الراء",
        "qalqalah_sughra": "قلقلة صغرى",
        "qalqalah_wusta": "قلقلة وسطى",
        "qalqalah_kubra": "قلقلة كبرى",
        "hamas": "الهمس"
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

// 3. DOM Elements Setup
const surahListContainer = document.getElementById('surahList');
const quranContainer = document.getElementById('quranContainer');
const currentSurahTitle = document.getElementById('currentSurahTitle');
const basmalahHeader = document.getElementById('basmalahHeader');
const defaultDetailsState = document.getElementById('defaultDetailsState');
const activeWordDetails = document.getElementById('activeWordDetails');
const selectedWordEl = document.getElementById('selectedWord');
const rulesListEl = document.getElementById('rulesList');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
const surahIndexSidebar = document.getElementById('surahIndexSidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

// Mobile menu toggling
function toggleMobileMenu() {
    surahIndexSidebar.classList.toggle('translate-x-full');
    mobileOverlay.classList.toggle('hidden');
}

if(mobileMenuBtn) mobileMenuBtn.onclick = toggleMobileMenu;
if(closeMobileMenuBtn) closeMobileMenuBtn.onclick = toggleMobileMenu;
if(mobileOverlay) mobileOverlay.onclick = toggleMobileMenu;

// 4. Core Initialization and Fetching Logic
async function init() {
    await fetchSurahList();
    await loadSurah(currentSurah);
}

async function fetchSurahList() {
    try {
        const response = await fetch(`${API_BASE_URL}/chapters?language=ar`);
        const data = await response.json();
        surahListContainer.innerHTML = '';
        
        data.chapters.forEach(chapter => {
            const btn = document.createElement('button');
            btn.className = `w-full text-right p-2 rounded mb-1 transition-colors text-sm font-semibold ${chapter.id === currentSurah ? 'bg-gold-100 text-gold-700 border border-gold-200' : 'text-ink-muted hover:bg-gray-50 hover:text-ink-main'}`;
            btn.innerHTML = `<span class="inline-block w-6 text-center text-xs opacity-70">${chapter.id}</span> ${chapter.name_arabic}`;
            btn.onclick = () => {
                if (currentSurah !== chapter.id) {
                    currentSurah = chapter.id;
                    loadSurah(currentSurah, chapter.name_arabic);
                    updateSurahSelection(chapter.id);
                    if (window.innerWidth < 1024) toggleMobileMenu();
                }
            };
            surahListContainer.appendChild(btn);
        });
    } catch (error) {
        surahListContainer.innerHTML = '<div class="text-red-500 text-center text-sm p-4">حدث خطأ في تحميل الفهرس.</div>';
    }
}

function updateSurahSelection(id) {
    Array.from(surahListContainer.children).forEach((btn, index) => {
        if (index + 1 === id) {
            btn.className = 'w-full text-right p-2 rounded mb-1 transition-colors text-sm font-semibold bg-gold-100 text-gold-700 border border-gold-200';
        } else {
            btn.className = 'w-full text-right p-2 rounded mb-1 transition-colors text-sm font-semibold text-ink-muted hover:bg-gray-50 hover:text-ink-main';
        }
    });
}

async function loadSurah(surahId, surahName = 'الفَاتِحَة') {
    quranContainer.innerHTML = '<div class="text-center text-ink-muted text-lg mt-10 flex flex-col items-center gap-3"><i class="ph-duotone ph-spinner-gap animate-spin text-3xl text-gold-500"></i> جاري تحميل السورة...</div>';
    currentSurahTitle.textContent = `سُورَةُ ${surahName}`;
    
    if (surahId !== 1 && surahId !== 9) {
        basmalahHeader.classList.remove('hidden');
    } else {
        basmalahHeader.classList.add('hidden');
    }

    closeWordDetails();

    try {
        await loadTajweedData(surahId);
        const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${surahId}?language=ar&words=true&word_fields=text_uthmani,line_number,page_number&per_page=300`);
        const data = await response.json();
        renderMushaf(data.verses);
    } catch (error) {
        quranContainer.innerHTML = '<div class="text-red-500 text-center text-lg mt-10 p-4">حدث خطأ أثناء تحميل الآيات.</div>';
    }
}

async function loadTajweedData(surahId) {
    try {
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

// 5. Rendering the Mushaf
function renderMushaf(verses) {
    quranContainer.innerHTML = '';
    const pages = {};
    
    // Group words by page and line
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
        pageDiv.className = 'quran-page mb-8';

        const lines = pages[pageNum];
        
        Object.keys(lines).forEach((lineNum) => {
            const lineElements = lines[lineNum];
            const lineDiv = document.createElement('div');
            
            const isShortLine = lineElements.length < 7;
            lineDiv.className = `flex flex-wrap items-center w-full min-h-[3.5rem] leading-none mb-1 ${isShortLine ? 'justify-center gap-3 md:gap-5' : 'justify-between'}`;

            lineElements.forEach(({ word, verse }) => {
                const span = document.createElement('span');
                span.className = 'word-token relative mx-1 cursor-pointer';
                
                if (word.char_type_name === 'end') {
                    span.className = 'inline-flex items-center justify-center w-8 h-8 mx-1 text-gold-500 font-quran text-lg md:text-xl align-middle';
                    const arabicNumber = verse.verse_number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
                    span.innerHTML = `﴿${arabicNumber}﴾`;
                } else {
                    const wordKey = `${currentSurah}:${verse.verse_number}:${word.position}`;
                    span.dataset.key = wordKey;
                    
                    const rules = tajweedData[wordKey] || [];
                    
                    // Render HTML with TajweedProcessor
                    span.innerHTML = TajweedProcessor.renderWordHTML(word.text_uthmani, rules);
                    
                    // Add click event listener to show details in sidebar
                    span.onclick = () => openWordDetails(word.text_uthmani, wordKey, rules);
                }
                lineDiv.appendChild(span);
            });
            
            pageDiv.appendChild(lineDiv);
        });
        quranContainer.appendChild(pageDiv);
    });
}

// 6. Sidebar Interactions (Word Details)
function openWordDetails(wordText, wordKey, rules) {
    document.querySelectorAll('.word-token.bg-gold-50').forEach(el => el.classList.remove('bg-gold-50'));
    const wordEl = document.querySelector(`span[data-key="${wordKey}"]`);
    if (wordEl) wordEl.classList.add('bg-gold-50');

    defaultDetailsState.classList.add('hidden');
    activeWordDetails.classList.remove('hidden');
    activeWordDetails.classList.add('flex');
    
    selectedWordEl.textContent = wordText;
    rulesListEl.innerHTML = '';
    
    if (rules && rules.length > 0) {
        rules.forEach(rule => {
            const ruleTitle = TajweedProcessor.labels[rule.type] || rule.type;
            // Using generic colors here, since color maps are now handled by CSS classes
            rulesListEl.innerHTML += `
                <div class="bg-surface border rounded-lg p-3 text-right" style="border-right: 4px solid #D4AF37; border-color: #D4AF3740;">
                    <div class="font-bold text-sm mb-1" style="color: #D4AF37">${ruleTitle}</div>
                    <div class="text-ink-main text-sm leading-relaxed">تطبق هذه القاعدة على الحرف المحدد.</div>
                </div>
            `;
        });
    } else {
        rulesListEl.innerHTML = `<div class="text-ink-muted text-sm text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">لا توجد أحكام تجويدية مسجلة لهذه الكلمة حالياً.</div>`;
    }
}

function closeWordDetails() {
    document.querySelectorAll('.word-token.bg-gold-50').forEach(el => el.classList.remove('bg-gold-50'));
    defaultDetailsState.classList.remove('hidden');
    activeWordDetails.classList.add('hidden');
    activeWordDetails.classList.remove('flex');
}

// Initialize App
document.addEventListener('DOMContentLoaded', init);
