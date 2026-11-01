// ==========================================
// 1. الإعدادات والمتغيرات والقواميس
// ==========================================
const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {};

// مجموعات الفلاتر الأفقية
const RULE_GROUPS = [
  { id: "madd_6", title: "🔴 مد 6 حركات لزوماً", color: "#dc2626", rules: ["madd_lazim_kalimi_muthaqqal", "madd_lazim_kalimi_mukhaffaf", "madd_lazim_harfi_muthaqqal", "madd_lazim_harfi_mukhaffaf"] },
  { id: "madd_4_5", title: "🟡 مد 4 أو 5 حركات (واجب وجائز)", color: "#eab308", rules: ["madd_muttasil", "madd_munfasil", "madd_silah_kubra"] },
  { id: "madd_2_4_6", title: "🟠 مد 2 أو 4 أو 6 جوازاً", color: "#f97316", rules: ["madd_ared", "madd_leen"] },
  { id: "madd_2", title: "🟡 مد حركتان", color: "#fde047", rules: ["madd_tabiee", "madd_silah_sughra", "madd_badal", "madd_iwad"] },
  { id: "ghunnah_ikhfa", title: "🟢 إخفاء ومواقع الغنة (حركتان)", color: "#10b981", rules: ["ikhfa", "ikhfa_shafawi", "ghunnah", "iqlab", "idgham_ghunnah", "idgham_shafawi"] },
  { id: "idgham_silent", title: "⚫ إدغام وما لا يُلفظ", color: "#4b5563", rules: ["idgham_no_ghunnah", "silent"] },
  { id: "idhar", title: "⚪ إظهار (ينطق بوضوح)", color: "#9ca3af", rules: ["idhar_halqi", "idhar_shafawi"] },
  { id: "tafkheem", title: "🔵 تفخيم", color: "#3b82f6", rules: ["tafkheem_general", "tafkheem_lam", "tafkheem_ra"] },
  { id: "tarqeeq", title: "🟣 ترقيق", color: "#a855f7", rules: ["tarqeeq_general", "tarqeeq_lam", "tarqeeq_ra"] },
  { id: "qalqalah", title: "🩵 قلقلة", color: "#06b6d4", rules: ["qalqalah_sughra", "qalqalah_wusta", "qalqalah_kubra"] },
  { id: "hamas", title: "🤍 همس", color: "#64748b", rules: ["hamas"] }
];

// القاموس التفصيلي لكل حكم
const RULE_INFO = {
  madd_lazim_kalimi_muthaqqal: { title: "المد اللازم الكلمي المثقل", desc: "أن يأتي بعد حرف المد حرف مشدد في كلمة.", color: "#dc2626" },
  madd_lazim_kalimi_mukhaffaf: { title: "المد اللازم الكلمي المخفف", desc: "أن يأتي بعد حرف المد حرف ساكن غير مشدد في كلمة.", color: "#dc2626" },
  madd_lazim_harfi_muthaqqal: { title: "المد اللازم الحرفي المثقل", desc: "في فواتح السور، حرف مد بعده حرف مشدد.", color: "#dc2626" },
  madd_lazim_harfi_mukhaffaf: { title: "المد اللازم الحرفي المخفف", desc: "في فواتح السور، حرف مد بعده حرف ساكن مخفف.", color: "#dc2626" },
  madd_muttasil: { title: "المد المتصل", desc: "أن يأتي حرف المد والهمزة في كلمة واحدة.", color: "#eab308" },
  madd_munfasil: { title: "المد المنفصل", desc: "أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التي تليها.", color: "#eab308" },
  madd_silah_kubra: { title: "مد الصلة الكبرى", desc: "هاء الضمير للمفرد الغائب إذا وقعت بين متحركين والثاني همزة.", color: "#eab308" },
  madd_ared: { title: "المد العارض للسكون", desc: "أن يقع السكون العارض لأجل الوقف بعد حرف مد.", color: "#f97316" },
  madd_leen: { title: "مد اللين", desc: "الوقف على الواو أو الياء الساكنتين المفتوح ما قبلهما.", color: "#f97316" },
  madd_tabiee: { title: "المد الطبيعي (الأصلي)", desc: "لا تقوم ذات الحرف إلا به ولا يتوقف على سبب.", color: "#fde047" },
  madd_silah_sughra: { title: "مد الصلة الصغرى", desc: "هاء الضمير الغائب بين متحركين ليس الثاني همزة.", color: "#fde047" },
  madd_badal: { title: "مد البدل", desc: "أن تتقدم الهمزة على حرف المد.", color: "#fde047" },
  madd_iwad: { title: "مد العوض", desc: "الوقف على التنوين المنصوب بألف عوضاً عنه.", color: "#fde047" },
  ikhfa: { title: "الإخفاء الحقيقي", desc: "النطق بالنون الساكنة بحالة بين الإظهار والإدغام مع الغنة.", color: "#10b981" },
  ikhfa_shafawi: { title: "الإخفاء الشفوي", desc: "إخفاء الميم الساكنة إذا أتى بعدها حرف الباء مع الغنة.", color: "#10b981" },
  ghunnah: { title: "غنة النون والميم المشددة", desc: "إخراج صوت الغنة من الخيشوم بمقدار حركتين.", color: "#10b981" },
  iqlab: { title: "الإقلاب", desc: "قلب النون الساكنة ميماً مخفاة بغنة عند الباء.", color: "#10b981" },
  idgham_ghunnah: { title: "الإدغام بغنة", desc: "إدغام النون في أحرف (ينمو) مع الغنة.", color: "#10b981" },
  idgham_shafawi: { title: "الإدغام الشفوي", desc: "إدغام الميم الساكنة في الميم المتحركة (متماثلين صغير).", color: "#10b981" },
  idgham_no_ghunnah: { title: "الإدغام بغير غنة", desc: "إدغام النون في (ل، ر) إدغاماً كاملاً.", color: "#4b5563" },
  silent: { title: "تكتب ولا تُلفظ", desc: "حروف صامتة لا تنطق كهمزة الوصل والألف التفريقية.", color: "#4b5563" },
  idhar_halqi: { title: "الإظهار الحلقي", desc: "إخراج النون الساكنة من مخرجها واضحة بدون غنة زائدة.", color: "#9ca3af" },
  idhar_shafawi: { title: "الإظهار الشفوي", desc: "إظهار الميم الساكنة عند باقي الحروف.", color: "#9ca3af" },
  tafkheem_general: { title: "تفخيم الحروف المستعلية", desc: "تغليظ الحرف عند النطق به.", color: "#3b82f6" },
  tafkheem_lam: { title: "تفخيم اللام", desc: "تفخيم لام لفظ الجلالة إذا سُبقت بفتح أو ضم.", color: "#3b82f6" },
  tafkheem_ra: { title: "تفخيم الراء", desc: "تفخيم الراء المفتوحة أو المضمومة.", color: "#3b82f6" },
  tarqeeq_general: { title: "ترقيق الحروف", desc: "تنحيف الحرف عند النطق به.", color: "#a855f7" },
  tarqeeq_lam: { title: "ترقيق اللام", desc: "ترقيق اللام في لفظ الجلالة إذا سُبقت بكسر.", color: "#a855f7" },
  tarqeeq_ra: { title: "ترقيق الراء", desc: "ترقيق الراء المكسورة أو الساكنة وقبلها كسر.", color: "#a855f7" },
  qalqalah_sughra: { title: "قلقلة صغرى", desc: "اضطراب الحرف الساكن في وسط الكلمة.", color: "#06b6d4" },
  qalqalah_wusta: { title: "قلقلة وسطى", desc: "الوقف على الحرف المقلقل غير المشدد.", color: "#06b6d4" },
  qalqalah_kubra: { title: "قلقلة كبرى", desc: "الوقف على الحرف المقلقل المشدد.", color: "#06b6d4" },
  hamas: { title: "الهمس", desc: "جريان النفس عند النطق بالحرف لضعف الاعتماد على المخرج.", color: "#64748b" }
};

// ==========================================
// 2. محرك التلوين وبناء الـ HTML (TajweedProcessor)
// ==========================================
const TajweedProcessor = {
    renderWordHTML(wordText, wordRules) {
        if (!wordRules || wordRules.length === 0) {
            return `<span>${wordText}</span>`;
        }

        const characters = Array.from(wordText);
        const charClasses = new Array(characters.length).fill(null).map(() => []);
        const charTooltips = new Array(characters.length).fill(null).map(() => []);

        wordRules.forEach(rule => {
            const ruleClass = `tajweed-${rule.type}`;
            const ruleInfo = RULE_INFO[rule.type];
            const ruleLabel = ruleInfo ? ruleInfo.title : rule.type;

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

// ==========================================
// 3. عناصر الواجهة (DOM Elements)
// ==========================================
const surahListContainer = document.getElementById('surahList');
const quranContainer = document.getElementById('quranContainer');
const currentSurahTitle = document.getElementById('currentSurahTitle');
const basmalahHeader = document.getElementById('basmalahHeader');
const filtersContainer = document.getElementById('filtersContainer');
const defaultDetailsState = document.getElementById('defaultDetailsState');
const activeWordDetails = document.getElementById('activeWordDetails');
const selectedWordEl = document.getElementById('selectedWord');
const rulesListEl = document.getElementById('rulesList');

// عناصر بطاقة شرح الحكم أعلى الصفحة
const ruleBriefCard = document.getElementById('ruleBriefCard');
const ruleBriefTitle = document.getElementById('ruleBriefTitle');
const ruleBriefDesc = document.getElementById('ruleBriefDesc');

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
const surahIndexSidebar = document.getElementById('surahIndexSidebar');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
  if(surahIndexSidebar) surahIndexSidebar.classList.toggle('translate-x-full');
  if(mobileOverlay) mobileOverlay.classList.toggle('hidden');
}

if(mobileMenuBtn) mobileMenuBtn.onclick = toggleMobileMenu;
if(closeMobileMenuBtn) closeMobileMenuBtn.onclick = toggleMobileMenu;
if(mobileOverlay) mobileOverlay.onclick = toggleMobileMenu;

// ==========================================
// 4. دوال التشغيل الأساسية وجلب البيانات
// ==========================================
async function init() {
  renderFilters(); // رسم الفلاتر الأفقية أعلى الصفحة
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
    
    // إذا كان هناك فلتر مفعل، قم بتطبيقه على السورة الجديدة
    if(currentFilter !== 'all') {
      const activeFilterBtn = document.querySelector(`.filter-chip[data-cat="${currentFilter}"]`);
      if(activeFilterBtn) applyFilter(currentFilter, activeFilterBtn);
    }
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

// ==========================================
// 5. رسم المصحف وتلوينه
// ==========================================
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
        span.className = 'word-token relative mx-1 cursor-pointer';
        
        if (word.char_type_name === 'end') {
          span.className = 'inline-flex items-center justify-center w-8 h-8 mx-1 text-gold-500 font-quran text-lg md:text-xl align-middle';
          const arabicNumber = verse.verse_number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
          span.innerHTML = `﴿${arabicNumber}﴾`;
        } else {
          const wordKey = `${currentSurah}:${verse.verse_number}:${word.position}`;
          span.dataset.key = wordKey;
          span.dataset.originalText = word.text_uthmani; // حفظ النص الأصلي للفلترة
          
          const rules = tajweedData[wordKey] || [];
          // تلوين الكلمة باستخدام المحرك
          span.innerHTML = TajweedProcessor.renderWordHTML(word.text_uthmani, rules);
          span.onclick = () => openWordDetails(word.text_uthmani, wordKey, rules);
        }
        lineDiv.appendChild(span);
      });
      
      quranContainer.appendChild(lineDiv);
    });
  });
}

// ==========================================
// 6. الفلاتر الأفقية واللوحة الجانبية
// ==========================================
function renderFilters() {
  if(!filtersContainer) return;
  filtersContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-chip bg-gold-600 text-white shadow-sm px-6 py-1.5 rounded-md font-bold mb-3 mx-auto block transition-all text-sm';
  allBtn.textContent = 'إظهار الكل';
  allBtn.dataset.cat = 'all';
  allBtn.onclick = () => applyFilter('all', allBtn);
  filtersContainer.appendChild(allBtn);

  RULE_GROUPS.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 p-2 mb-1.5 bg-gray-50 border border-gray-200 rounded-md w-full';

    const groupTitle = document.createElement('h3');
    groupTitle.className = 'text-xs md:text-sm font-bold whitespace-nowrap shrink-0';
    groupTitle.style.color = group.color;
    groupTitle.textContent = group.title + " :";
    groupDiv.appendChild(groupTitle);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex flex-wrap gap-1.5 flex-1';

    group.rules.forEach(ruleKey => {
      const rule = RULE_INFO[ruleKey];
      if (!rule) return;

      const btn = document.createElement('button');
      btn.className = 'filter-chip bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors shadow-sm';
      btn.textContent = rule.title;
      btn.dataset.cat = ruleKey; 
      btn.onclick = () => applyFilter(ruleKey, btn);
      buttonsContainer.appendChild(btn);
    });

    groupDiv.appendChild(buttonsContainer);
    filtersContainer.appendChild(groupDiv);
  });
}

function applyFilter(category, btnElement) {
  currentFilter = category;
  
  // تحديث تصميم الأزرار
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('bg-gold-600', 'text-white', 'shadow-md', 'border-transparent');
    b.classList.add('bg-white', 'border-gray-200', 'text-gray-700');
    b.style.backgroundColor = '';
    b.style.color = '';
  });

  if (category !== 'all') {
    const ruleData = RULE_INFO[category];
    if(ruleData) {
        btnElement.classList.remove('bg-white', 'border-gray-200', 'text-gray-700');
        btnElement.style.backgroundColor = ruleData.color;
        btnElement.style.color = '#ffffff';
        btnElement.classList.add('shadow-md', 'border-transparent');
    }
  } else {
    btnElement.classList.remove('bg-white', 'border-gray-200', 'text-gray-700');
    btnElement.classList.add('bg-gold-600', 'text-white', 'shadow-md');
  }

  const allWords = document.querySelectorAll('.word-token');
  
  // حالة إظهار الكل: نعيد تلوين الكلمة بكل الأحكام الموجودة فيها
  if (category === 'all') {
    if(ruleBriefCard) ruleBriefCard.classList.add('hidden');
    allWords.forEach(w => {
      w.classList.remove('opacity-30', 'grayscale');
      const wordKey = w.dataset.key;
      if (wordKey && w.dataset.originalText) {
          const rules = tajweedData[wordKey] || [];
          w.innerHTML = TajweedProcessor.renderWordHTML(w.dataset.originalText, rules);
      }
