const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {}; 

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

const surahListContainer = document.getElementById('surahList');
const quranContainer = document.getElementById('quranContainer');
const currentSurahTitle = document.getElementById('currentSurahTitle');
const basmalahHeader = document.getElementById('basmalahHeader');
const filtersContainer = document.getElementById('filtersContainer');
const defaultDetailsState = document.getElementById('defaultDetailsState');
const activeWordDetails = document.getElementById('activeWordDetails');
const selectedWordEl = document.getElementById('selectedWord');
const rulesListEl = document.getElementById('rulesList');

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
const surahIndexSidebar = document.getElementById('surahIndexSidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
  surahIndexSidebar.classList.toggle('translate-x-full');
  mobileOverlay.classList.toggle('hidden');
}

mobileMenuBtn.onclick = toggleMobileMenu;
closeMobileMenuBtn.onclick = toggleMobileMenu;
mobileOverlay.onclick = toggleMobileMenu;

async function init() {
  renderFilters();
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
          if(window.innerWidth < 1024) toggleMobileMenu();
        }
      };
      surahListContainer.appendChild(btn);
    });
  } catch (error) {
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
    await loadTajweedData(surahId); // استدعاء البيانات من ملف الـ JSON الخارجي
    const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${surahId}?language=ar&words=true&word_fields=text_uthmani,line_number,page_number&per_page=300`);
    const data = await response.json();
    renderMushaf(data.verses);
    
    // إعادة تطبيق الفلتر الحالي إن وُجد
    if(currentFilter !== 'all') {
      const activeFilterBtn = document.querySelector(`.filter-chip[data-cat="${currentFilter}"]`);
      if(activeFilterBtn) applyFilter(currentFilter, activeFilterBtn);
    }
  } catch (error) {
    quranContainer.innerHTML = '<div class="text-red-500 text-center text-lg mt-10">حدث خطأ أثناء تحميل الآيات.</div>';
  }
}

function renderMushaf(verses) {
  quranContainer.innerHTML = '';
  const pages = {};
  
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
    const pageBreak = document.createElement('div');
    pageBreak.className = 'w-full border-b border-dashed border-gold-300 my-8 relative flex justify-center';
    pageBreak.innerHTML = `<span class="absolute -top-3 bg-surface px-4 text-gold-600 text-xs font-bold border border-gold-200 rounded-full font-cairo shadow-sm">صفحة ${pageNum}</span>`;
    quranContainer.appendChild(pageBreak);

    const lines = pages[pageNum];
    
    Object.keys(lines).forEach((lineNum) => {
      const lineElements = lines[lineNum];
      const lineDiv = document.createElement('div');
      
      const isShortLine = lineElements.length < 7;
      lineDiv.className = `flex flex-wrap items-center w-full min-h-[3.5rem] leading-none mb-1 ${isShortLine ? 'justify-center gap-3 md:gap-5' : 'justify-between'}`;

      lineElements.forEach(({ word, verse }) => {
        const span = document.createElement('span');
        span.className = 'word-token relative';
        
        if (word.char_type_name === 'end') {
          span.className = 'inline-flex items-center justify-center w-8 h-8 mx-1 text-gold-500 font-quran text-lg md:text-xl align-middle';
          const arabicNumber = verse.verse_number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
          span.innerHTML = `﴿${arabicNumber}﴾`;
        } else {
          span.textContent = word.text_uthmani;
          const wordKey = `${currentSurah}:${verse.verse_number}:${word.position}`;
          span.dataset.key = wordKey;
          
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
      
      quranContainer.appendChild(lineDiv);
    });
  });
}

// التعديل الرئيسي هنا: جلب البيانات من المجلد
async function loadTajweedData(surahId) {
  try {
    // استخدم المسار النسبي لكي يعمل بشكل صحيح على GitHub Pages
    const response = await fetch(`./data/tajweed_db/surah_${surahId}.json`);
    
    // إذا لم يكن الملف موجوداً (السورة لم تُضف لها أحكام بعد)، لا توقف البرنامج
    if (!response.ok) {
      tajweedData = {};
      return;
    }
    tajweedData = await response.json();
  } catch (error) {
    // إذا فشل الجلب لأي سبب (مثلاً الملف غير موجود)، اجعل البيانات فارغة وتجاهل الخطأ
    tajweedData = {};
  }
}

function openWordDetails(wordText, wordKey, rules) {
  document.querySelectorAll('.word-token.speaking').forEach(el => el.classList.remove('speaking'));
  const wordEl = document.querySelector(`span[data-key="${wordKey}"]`);
  if (wordEl) wordEl.classList.add('speaking');

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
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('bg-gold-600', 'text-white', 'shadow-md');
    b.classList.add('bg-surface', 'border-gold-200', 'text-ink-muted');
  });
  btnElement.classList.remove('bg-surface', 'border-gold-200', 'text-ink-muted');
  btnElement.classList.add('bg-gold-600', 'text-white', 'shadow-md');

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

// بدء التشغيل
init();
