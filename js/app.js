// --- إعدادات التطبيق الأساسية ---
const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {}; // سيتم تخزين أحكام السورة الحالية هنا

// تعريف قواعد التجويد الأساسية وألوانها لتوليد الفلاتر
const RULE_INFO = {
  hamas: { title: "الهمس", desc: "جريان النَّفَس عند النطق بالحرف لضعف الاعتماد على مخرجه." },
  tafkheem: { title: "التفخيم", desc: "تسمين الحرف وتغليظه حتى يمتلئ الفم بصداه." },
  tarqeeq: { title: "الترقيق", desc: "تنحيف الحرف ونطقه نحيلاً فلا يمتلئ الفم بصداه." },
  madd_tabiee: { title: "المد الطبيعي", desc: "المد الذي لا تقوم ذات حرف المد إلا به ولا يتوقف على سبب." },
  lam_shamsiya: { title: "اللام الشمسية", desc: "لام (أل) التعريف المدغمة في الحرف الذي يليها فلا تُنطق." },
  lam_qamariya: { title: "اللام القمرية", desc: "لام (أل) التعريف المظهرة الساكنة." },
  idhar: { title: "الإظهار", desc: "إخراج الحرف من مخرجه بغير غنة زائدة." },
  ikhfa: { title: "الإخفاء", desc: "النطق بالحرف بصفة بين الإظهار والإدغام مع بقاء الغنة." }
};

// --- العناصر في واجهة المستخدم (DOM Elements) ---
const surahListContainer = document.getElementById('surahList');
const quranContainer = document.getElementById('quranContainer');
const currentSurahTitle = document.getElementById('currentSurahTitle');
const filtersContainer = document.getElementById('filtersContainer');
const defaultDetailsState = document.getElementById('defaultDetailsState');
const activeWordDetails = document.getElementById('activeWordDetails');
const selectedWordEl = document.getElementById('selectedWord');
const rulesListEl = document.getElementById('rulesList');

// --- التهيئة عند تحميل الصفحة (Initialization) ---
async function init() {
  renderFilters();
  await fetchSurahList();
  await loadSurah(currentSurah);
}

// --- جلب وعرض فهرس السور ---
async function fetchSurahList() {
  try {
    const response = await fetch(`${API_BASE_URL}/chapters?language=ar`);
    const data = await response.json();
    
    surahListContainer.innerHTML = ''; // تفريغ القائمة
    
    data.chapters.forEach(chapter => {
      const btn = document.createElement('button');
      btn.className = `w-full text-right p-2 rounded mb-1 transition-colors text-sm font-semibold ${chapter.id === currentSurah ? 'bg-gold-100 text-gold-700 border border-gold-200' : 'text-ink-muted hover:bg-gray-50 hover:text-ink-main'}`;
      btn.innerHTML = `<span class="inline-block w-6 text-center text-xs opacity-70">${chapter.id}</span> ${chapter.name_arabic}`;
      
      btn.onclick = () => {
        if (currentSurah !== chapter.id) {
          currentSurah = chapter.id;
          loadSurah(currentSurah, chapter.name_arabic);
          updateSurahSelection(chapter.id);
        }
      };
      
      surahListContainer.appendChild(btn);
    });
  } catch (error) {
    console.error('Error fetching surahs:', error);
    surahListContainer.innerHTML = '<div class="text-red-500 text-center text-sm">حدث خطأ في تحميل الفهرس.</div>';
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

// --- جلب آيات السورة وعرضها (محرك الواجهة) ---
async function loadSurah(surahId, surahName = 'الفَاتِحَة') {
  quranContainer.innerHTML = '<div class="text-center text-ink-muted text-lg mt-10">جاري تحميل السورة...</div>';
  currentSurahTitle.textContent = `سُورَةُ ${surahName}`;
  closeWordDetails(); // إغلاق التفاصيل عند تغيير السورة

  try {
    // محاكاة جلب ملف الـ JSON الخاص بالتجويد (سيتم تغييره لاحقاً ليكون fetch حقيقي)
    await loadTajweedData(surahId);

    // جلب كلمات السورة من Quran.com (يتضمن رقم السطر والصفحة لكل كلمة)
    const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${surahId}?language=ar&words=true&word_fields=text_uthmani,line_number,page_number&per_page=300`);
    const data = await response.json();
    
    renderMushaf(data.verses);
    
  } catch (error) {
    console.error('Error loading surah:', error);
    quranContainer.innerHTML = '<div class="text-red-500 text-center text-lg mt-10">حدث خطأ أثناء تحميل الآيات. يرجى المحاولة مرة أخرى.</div>';
  }
}

// --- بناء السطور لتطابق المصحف العثماني ---
function renderMushaf(verses) {
  quranContainer.innerHTML = '';
  
  let currentLineNumber = -1;
  let lineDiv = null;

  verses.forEach(verse => {
    verse.words.forEach(word => {
      // تجاهل علامات التوقف (End of verse marks) إذا كانت تأتي ككلمات منفصلة بدون نص عثماني
      if (!word.text_uthmani && word.char_type_name !== 'end') return;

      // إذا تغير رقم السطر، ننشئ حاوية (div) جديدة لتمثيل السطر
      if (word.line_number !== currentLineNumber) {
        currentLineNumber = word.line_number;
        lineDiv = document.createElement('div');
        lineDiv.className = 'flex flex-wrap justify-center md:justify-between items-center w-full min-h-[3rem] mb-2 leading-none';
        
        // لمحاذاة السطور بشكل مثالي زي المصحف (Justify)
        if (word.line_number > 1) {
          lineDiv.style.justifyContent = 'space-between';
        } else {
          lineDiv.style.justifyContent = 'center'; // البسملة أو أول سطر غالباً في المنتصف
        }
        
        quranContainer.appendChild(lineDiv);
      }

      // إنشاء الكلمة
      const span = document.createElement('span');
      span.className = 'word-token relative';
      
      // إذا كانت علامة نهاية الآية (رقم الآية)
      if (word.char_type_name === 'end') {
        span.className = 'inline-flex items-center justify-center w-8 h-8 mx-1 text-gold-600 font-quran text-lg md:text-xl align-middle';
        // تحويل الرقم إلى أرقام عربية (هندية)
        const arabicNumber = verse.verse_number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
        span.innerHTML = `﴿${arabicNumber}﴾`;
      } else {
        // كلمة عادية
        span.textContent = word.text_uthmani;
        
        // استخراج معرف الكلمة لربطها بملف التجويد (مثال: 1:1:1)
        const wordKey = `${currentSurah}:${verse.verse_number}:${word.position}`;
        span.dataset.key = wordKey;
        
        // إضافة الأحكام إن وجدت
        const rules = tajweedData[wordKey];
        if (rules) {
          span.dataset.categories = rules.map(r => r.type).join(' ');
        } else {
          span.dataset.categories = '';
        }

        span.onclick = () => openWordDetails(word.text_uthmani, wordKey, rules);
      }

      lineDiv.appendChild(span);
    });
  });
}

// --- محاكاة جلب بيانات التجويد (مستقبلاً سيتم جلبها من مجلد data) ---
async function loadTajweedData(surahId) {
  // حالياً بيانات تجريبية لسورة الفاتحة فقط. 
  // في المستقبل سيكون الكود كالتالي:
  // const res = await fetch(`../data/tajweed_db/surah_${surahId}.json`);
  // tajweedData = await res.json();
  
  if (surahId === 1) {
    tajweedData = {
      "1:1:1": [
        { type: "tarqeeq", text: "ترقيق الباء والسين والميم." }
      ],
      "1:1:3": [
        { type: "lam_shamsiya", text: "إدغام لام التعريف في الراء." },
        { type: "tafkheem", text: "تفخيم الراء المفتوحة." }
      ]
    };
  } else {
    tajweedData = {};
  }
}

// --- التحكم في اللوحة الجانبية وتفاصيل التجويد ---
function openWordDetails(wordText, wordKey, rules) {
  // تسليط الضوء على الكلمة المحددة فقط
  document.querySelectorAll('.word-token.speaking').forEach(el => el.classList.remove('speaking'));
  const wordEl = document.querySelector(`span[data-key="${wordKey}"]`);
  if (wordEl) wordEl.classList.add('speaking');

  // تغيير حالة اللوحة الجانبية
  defaultDetailsState.classList.add('hidden');
  activeWordDetails.classList.remove('hidden');
  activeWordDetails.classList.add('flex');
  
  selectedWordEl.textContent = wordText;
  rulesListEl.innerHTML = '';
  
  if (rules && rules.length > 0) {
    rules.forEach(rule => {
      const ruleInfo = RULE_INFO[rule.type] || { title: rule.type, desc: "" };
      rulesListEl.innerHTML += `
        <div class="bg-gold-50/40 border border-gold-100 rounded-lg p-3 border-r-4 border-r-gold-500 text-right">
          <div class="font-bold text-gold-700 text-sm mb-1">${ruleInfo.title}</div>
          <div class="text-ink-main text-sm leading-relaxed">${rule.text || ruleInfo.desc}</div>
        </div>
      `;
    });
  } else {
    rulesListEl.innerHTML = `<div class="text-ink-muted text-sm text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">لا توجد أحكام تجويدية مسجلة لهذه الكلمة حالياً.</div>`;
  }
}

function closeWordDetails() {
  document.querySelectorAll('.word-token.speaking').forEach(el => el.classList.remove('speaking'));
  defaultDetailsState.classList.remove('hidden');
  activeWordDetails.classList.add('hidden');
  activeWordDetails.classList.remove('flex');
}

// --- الفلاتر وتصفية الأحكام ---
function renderFilters() {
  filtersContainer.innerHTML = `<button data-cat="all" onclick="applyFilter('all', this)" class="filter-chip bg-gold-600 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex-shrink-0 transition-all shadow-md">الكل</button>`;
  
  Object.keys(RULE_INFO).forEach(key => {
    const title = RULE_INFO[key].title;
    const btn = document.createElement('button');
    btn.className = 'filter-chip bg-surface border border-gold-200 text-ink-muted hover:bg-gold-50 hover:border-gold-300 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold flex-shrink-0 transition-all';
    btn.textContent = title;
    btn.dataset.cat = key;
    btn.onclick = () => applyFilter(key, btn);
    filtersContainer.appendChild(btn);
  });
}

function applyFilter(category, btnElement) {
  currentFilter = category;
  
  // تحديث ألوان الأزرار
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('bg-gold-600', 'text-white', 'shadow-md');
    b.classList.add('bg-surface', 'border-gold-200', 'text-ink-muted');
  });
  
  btnElement.classList.remove('bg-surface', 'border-gold-200', 'text-ink-muted');
  btnElement.classList.add('bg-gold-600', 'text-white', 'shadow-md');

  // تطبيق التصفية على الكلمات
  const allWords = document.querySelectorAll('.word-token');
  
  if (category === 'all') {
    allWords.forEach(w => {
      w.classList.remove('highlight-filter', 'opacity-30', 'grayscale');
      w.style.borderBottom = 'none';
      w.style.backgroundColor = 'transparent';
    });
    return;
  }

  allWords.forEach(w => {
    // نتخطى علامات الآيات
    if (!w.dataset.categories && w.innerHTML.includes('﴿')) return;
    
    const cats = (w.dataset.categories || '').split(' ');
    if (cats.includes(category)) {
      w.classList.remove('opacity-30', 'grayscale');
      w.classList.add('highlight-filter');
      w.style.backgroundColor = '#F9F1DC';
      w.style.borderBottom = '2px solid #D4AF37';
    } else {
      w.classList.remove('highlight-filter');
      w.style.backgroundColor = 'transparent';
      w.style.borderBottom = 'none';
      w.classList.add('opacity-30', 'grayscale');
    }
  });
}

// بدء التطبيق
init();
