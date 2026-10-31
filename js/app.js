const API_BASE_URL = 'https://api.quran.com/api/v4';
let currentSurah = 1;
let currentFilter = 'all';
let tajweedData = {}; 

// 1. تعريف المجموعات (للعرض في الواجهة كعناوين أفقية غير قابلة للضغط)
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

// 2. القاموس التفصيلي للأحكام (يُستخدم للتلوين والشرح عند الضغط على الزر الفرعي)
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

// ----------------------------------------------------
// الدوال المحدثة (التي ترسم المجموعات وتطبق الفلترة)
// ----------------------------------------------------
function renderFilters() {
  filtersContainer.innerHTML = '';

  // زر إظهار الكل
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-chip bg-gold-600 text-white shadow-md px-6 py-2 rounded-md font-bold mb-6 mx-auto block transition-all';
  allBtn.textContent = 'إظهار الكل';
  allBtn.dataset.cat = 'all';
  allBtn.onclick = () => applyFilter('all', allBtn);
  filtersContainer.appendChild(allBtn);

  // بناء المجموعات الأفقية
  RULE_GROUPS.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'rule-group mb-5 border-b border-gray-200 pb-3 w-full';

    // عنوان المجموعة (غير قابل للضغط)
    const groupTitle = document.createElement('h3');
    groupTitle.className = 'text-sm font-bold mb-3';
    groupTitle.style.color = group.color;
    groupTitle.textContent = group.title;
    groupDiv.appendChild(groupTitle);

    // حاوية الأزرار الفرعية
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex flex-wrap gap-2';

    group.rules.forEach(ruleKey => {
      const rule = RULE_INFO[ruleKey];
      if (!rule) return;

      const btn = document.createElement('button');
      btn.className = 'filter-chip bg-surface border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs md:text-sm hover:bg-gray-100 transition-colors';
      btn.textContent = rule.title;
      btn.dataset.cat = ruleKey; // نستخدم dataset.cat ليتوافق مع loadSurah
      btn.onclick = () => applyFilter(ruleKey, btn);
      buttonsContainer.appendChild(btn);
    });

    groupDiv.appendChild(buttonsContainer);
    filtersContainer.appendChild(groupDiv);
  });
}

function applyFilter(category, btnElement) {
  currentFilter = category;
  
  // إعادة ضبط تصميم كل الأزرار
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('bg-gold-600', 'text-white', 'shadow-md', 'border-transparent');
    b.classList.add('bg-surface', 'border-gray-300', 'text-gray-700');
    b.style.backgroundColor = '';
    b.style.color = '';
  });

  // تمييز الزر المختار بالألوان المخصصة له
  if (category !== 'all') {
    const ruleData = RULE_INFO[category];
    btnElement.classList.remove('bg-surface', 'border-gray-300', 'text-gray-700');
    btnElement.style.backgroundColor = ruleData.color;
    btnElement.style.color = '#ffffff';
    btnElement.classList.add('shadow-md', 'border-transparent');
  } else {
    btnElement.classList.remove('bg-surface', 'border-gray-300', 'text-gray-700');
    btnElement.classList.add('bg-gold-600', 'text-white', 'shadow-md');
  }

  const allWords = document.querySelectorAll('.word-token');
  
  if (category === 'all') {
    if(ruleBriefCard) ruleBriefCard.classList.add('hidden');
    allWords.forEach(w => {
      w.classList.remove('opacity-30', 'grayscale');
      if(w.dataset.originalText) w.innerHTML = w.dataset.originalText;
    });
    return;
  }

  const ruleData = RULE_INFO[category];
  if(ruleBriefCard) {
    ruleBriefTitle.textContent = ruleData.title;
    ruleBriefTitle.style.color = ruleData.color;
    ruleBriefDesc.textContent = ruleData.desc;
    ruleBriefCard.style.borderColor = ruleData.color + '60';
    ruleBriefCard.style.borderRightWidth = '4px';
    ruleBriefCard.style.borderRightColor = ruleData.color;
    ruleBriefCard.classList.remove('hidden');
  }

  allWords.forEach(w => {
    if (!w.dataset.categories && w.innerHTML.includes('﴿')) return;
    
    const wordKey = w.dataset.key;
    const rules = tajweedData[wordKey] || [];
    const targetRule = rules.find(r => r.type === category);

    if (!w.dataset.originalText) {
      w.dataset.originalText = w.textContent;
    }

    if (targetRule && targetRule.chars) {
      w.classList.remove('opacity-30', 'grayscale');
      
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
