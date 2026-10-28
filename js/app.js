const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {}; 

// القاموس الشامل لأحكام التجويد والألوان القياسية
const RULE_INFO = {
  // 1. أحكام النون الساكنة والتنوين والميم
  idhar_halqi: { title: "الإظهار الحلقي", desc: "إخراج النون الساكنة من مخرجها بغير غنة زائدة.", color: "#10b981" }, // أخضر
  idhar_shafawi: { title: "الإظهار الشفوي", desc: "إخراج الميم الساكنة من مخرجها واضحة بغير غنة.", color: "#10b981" }, // أخضر
  ikhfa: { title: "الإخفاء", desc: "النطق بالحرف بصفة بين الإظهار والإدغام مع بقاء الغنة.", color: "#10b981" }, // أخضر
  ikhfa_shafawi: { title: "الإخفاء الشفوي", desc: "إخفاء الميم الساكنة عند حرف الباء مع الغنة.", color: "#10b981" }, // أخضر
  iqlab: { title: "الإقلاب", desc: "قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند الباء.", color: "#10b981" }, // أخضر
  idgham_ghunnah: { title: "إدغام بغنة", desc: "إدغام النون أو التنوين في أحرف (ينمو) مع مصاحبة الغنة.", color: "#10b981" }, // أخضر
  idgham_no_ghunnah: { title: "إدغام بغير غنة", desc: "إدغام النون أو التنوين في (ل، ر) إدغاماً كاملاً بدون غنة.", color: "#9ca3af" }, // رمادي
  ghunnah: { title: "غنة ميّم ونون مشددتين", desc: "إخراج صوت الغنة من الخيشوم بمقدار حركتين.", color: "#10b981" }, // أخضر

  // 2. أحكام المدود
  madd_tabiee: { title: "المد الطبيعي", desc: "المد الأصلي الذي لا يتوقف على سبب، يُمَد حركتين.", color: "#ef4444" }, // أحمر
  madd_badal: { title: "مد البدل", desc: "كل همز ممدود يُمَد حركتين.", color: "#ef4444" }, // أحمر
  madd_iwad: { title: "مد العوض", desc: "التعويض عن تنوين الفتح بألف مد عند الوقف حركتين.", color: "#ef4444" }, // أحمر
  madd_silah_sughra: { title: "مد صلة صغرى", desc: "مد هاء الضمير حركتين إذا لم يأتِ بعدها همز.", color: "#ef4444" }, // أحمر
  madd_muttasil: { title: "المد المتصل", desc: "أن يأتي حرف المد وبعده همزة في نفس الكلمة، يُمَد 4-5 حركات.", color: "#f97316" }, // برتقالي/أحمر فاتح
  madd_munfasil: { title: "المد المنفصل", desc: "أن يأتي حرف المد آخر الكلمة والهمزة أول الكلمة التالية، يُمَد 4-5 حركات.", color: "#f97316" }, // برتقالي/أحمر فاتح
  madd_silah_kubra: { title: "مد صلة كبرى", desc: "مد هاء الضمير 4-5 حركات لمجيء همزة قطع بعدها.", color: "#f97316" }, // برتقالي/أحمر فاتح
  madd_ared: { title: "مد عارض للسكون", desc: "الوقف على الحرف الأخير بالسكون وقبله حرف مد، يُمَد 2، 4، أو 6 حركات.", color: "#f97316" }, // برتقالي/أحمر فاتح
  madd_lazim: { title: "المد اللازم", desc: "أن يأتي بعد حرف المد سكون أصلي أو حرف مشدد، يُمَد 6 حركات لزوماً.", color: "#9f1239" }, // أحمر غامق

  // 3. أحكام التفخيم والترقيق والصفات
  tafkheem: { title: "التفخيم", desc: "تسمين الحرف وتغليظه (خص ضغط قظ، والراء أحياناً).", color: "#3b82f6" }, // أزرق
  tarqeeq: { title: "الترقيق", desc: "تنحيف الحرف ونطقه نحيلاً.", color: "#14b8a6" }, // تركواز (اختياري، بعض المصاحف لا تلونه)
  qalqalah: { title: "القلقلة", desc: "اضطراب المخرج عند النطق بالحرف ساكناً (قطب جد).", color: "#0ea5e9" }, // أزرق سماوي
  hamas: { title: "الهمس", desc: "جريان النَّفَس عند النطق بالحرف لضعف الاعتماد على مخرجه.", color: "#8b5cf6" }, // بنفسجي
  
  // 4. أحكام أخرى
  lam_shamsiya: { title: "اللام الشمسية", desc: "لام التعريف المدغمة في الحرف الذي يليها، تكتب ولا تُنطق.", color: "#9ca3af" }, // رمادي
  lam_qamariya: { title: "اللام القمرية", desc: "لام التعريف المظهرة الساكنة.", color: "#f59e0b" }, // عنبري
  silent: { title: "حروف تُكتب ولا تُنطق", desc: "حروف زائدة رسماً تسقط في اللفظ (مثل همزة الوصل في درج الكلام، وألف التفريق).", color: "#9ca3af" }, // رمادي

  // الأحكام المضافة لمعالجة اختلاف الإملاء البرمجي
  idghaam_ghunnah: { title: "إدغام بغنة", desc: "إدغام النون أو التنوين في أحرف (ينمو) مع مصاحبة الغنة.", color: "#10b981" },
  idghaam_shafawi: { title: "إدغام شفوي", desc: "إدغام الميم الساكنة في الميم المتحركة التي تليها (إدغام متماثلين صغير) مع الغنة.", color: "#10b981" },
  idghaam_no_ghunnah: { title: "إدغام بغير غنة", desc: "إدغام النون أو التنوين في (ل، ر) إدغاماً كاملاً بدون غنة.", color: "#9ca3af" }
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

// عناصر بطاقة شرح الحكم
const ruleBriefCard = document.getElementById('ruleBriefCard');
const ruleBriefTitle = document.getElementById('ruleBriefTitle');
const ruleBriefDesc = document.getElementById('ruleBriefDesc');

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
    await loadTajweedData(surahId); 
    const response = await fetch(`${API_BASE_URL}/verses/by_chapter/${surahId}?language=ar&words=true&word_fields=text_uthmani,line_number,page_number&per_page=300`);
    const data = await response.json();
    renderMushaf(data.verses);
    
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

async function loadTajweedData(surahId) {
  try {
    const response = await fetch(`./data/tajweed_db/surah_${surahId}.json`);
    if (!response.ok) {
      tajweedData = {};
      return;
    }
    tajweedData = await response.json();
  } catch (error) {
    tajweedData = {};
  }
}

function openWordDetails(wordText, wordKey, rules) {
  document.querySelectorAll('.word-token.speaking').forEach(el => el.classList.remove('speaking', 'bg-gold-50'));
  const wordEl = document.querySelector(`span[data-key="${wordKey}"]`);
  if (wordEl) wordEl.classList.add('bg-gold-50');

  defaultDetailsState.classList.add('hidden');
  activeWordDetails.classList.remove('hidden');
  activeWordDetails.classList.add('flex');
  
  selectedWordEl.textContent = wordText;
  rulesListEl.innerHTML = '';
  
  if (rules && rules.length > 0) {
    rules.forEach(rule => {
      const ruleInfo = RULE_INFO[rule.type] || { title: rule.type, desc: "", color: "#D4AF37" };
      rulesListEl.innerHTML += `
        <div class="bg-surface border rounded-lg p-3 text-right" style="border-right: 4px solid ${ruleInfo.color}; border-color: ${ruleInfo.color}40;">
          <div class="font-bold text-sm mb-1" style="color: ${ruleInfo.color}">${ruleInfo.title}</div>
          <div class="text-ink-main text-sm leading-relaxed">${rule.text || ruleInfo.desc}</div>
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
    ruleBriefCard.classList.add('hidden');
    allWords.forEach(w => {
      w.classList.remove('opacity-30', 'grayscale');
      // إعادة النص لحالته الأصلية بدون الـ spans الداخلية
      if(w.dataset.originalText) w.innerHTML = w.dataset.originalText;
    });
    return;
  }

  const ruleData = RULE_INFO[category];
  ruleBriefTitle.textContent = ruleData.title;
  ruleBriefTitle.style.color = ruleData.color;
  ruleBriefDesc.textContent = ruleData.desc;
  ruleBriefCard.style.borderColor = ruleData.color + '60';
  ruleBriefCard.style.borderRightWidth = '4px';
  ruleBriefCard.style.borderRightColor = ruleData.color;
  ruleBriefCard.classList.remove('hidden');

  allWords.forEach(w => {
    if (!w.dataset.categories && w.innerHTML.includes('﴿')) return;
    
    const wordKey = w.dataset.key;
    const rules = tajweedData[wordKey] || [];
    const targetRule = rules.find(r => r.type === category);

    // حفظ النص الأصلي إذا لم يكن محفوظاً
    if (!w.dataset.originalText) {
      w.dataset.originalText = w.textContent;
    }

    if (targetRule && targetRule.chars) {
      w.classList.remove('opacity-30', 'grayscale');
      
      // تقطيع الكلمة وتلوين الحروف المحددة فقط
      const chars = Array.from(w.dataset.originalText);
      let newHtml = '';
      chars.forEach((char, index) => {
        if (targetRule.chars.includes(index)) {
          newHtml += `<span style="color: ${ruleData.color}; font-weight: bold;">${char}</span>`;
        } else {
          newHtml += char;
        }
      });
      w.innerHTML = newHtml;
      
    } else {
      w.innerHTML = w.dataset.originalText;
      w.classList.add('opacity-30', 'grayscale');
    }
  });
}

init();
