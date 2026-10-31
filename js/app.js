// ==========================================
// 1. قاموس المجموعات والأحكام (Data Dictionaries)
// ==========================================

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

// متغيرات عامة
let tajweedData = {}; // سيتم تحميل البيانات هنا من ملف الـ JSON
let currentFilter = 'all';

// عناصر الواجهة (تأكد من مطابقة الـ IDs مع ملف الـ HTML الخاص بك)
const filtersContainer = document.getElementById('filters-container');
const ruleBriefCard = document.getElementById('rule-brief-card');
const ruleBriefTitle = document.getElementById('rule-brief-title');
const ruleBriefDesc = document.getElementById('rule-brief-desc');

// ==========================================
// 2. دالة بناء أزرار الفلترة (المجموعات الأفقية)
// ==========================================
function renderFilters() {
  filtersContainer.innerHTML = '';

  // زر إظهار الكل
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-chip bg-gold-600 text-white shadow-md px-4 py-2 rounded-md font-bold mb-4';
  allBtn.textContent = 'إظهار الكل';
  allBtn.onclick = () => applyFilter('all', allBtn);
  filtersContainer.appendChild(allBtn);

  // بناء المجموعات
  RULE_GROUPS.forEach(group => {
    // حاوية المجموعة
    const groupDiv = document.createElement('div');
    groupDiv.className = 'rule-group mb-4 border-b border-gray-200 pb-2';

    // عنوان المجموعة (غير قابل للضغط)
    const groupTitle = document.createElement('h3');
    groupTitle.className = 'text-sm font-bold mb-2';
    groupTitle.style.color = group.color;
    groupTitle.textContent = group.title;
    groupDiv.appendChild(groupTitle);

    // حاوية الأزرار الفرعية (أفقية)
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex flex-wrap gap-2';

    // الأزرار الفرعية
    group.rules.forEach(ruleKey => {
      const rule = RULE_INFO[ruleKey];
      if (!rule) return;

      const btn = document.createElement('button');
      // تصميم الزر الفرعي الافتراضي
      btn.className = 'filter-chip bg-surface border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-100 transition-colors';
      btn.textContent = rule.title;
      btn.dataset.rule = ruleKey;
      
      btn.onclick = () => applyFilter(ruleKey, btn);
      buttonsContainer.appendChild(btn);
    });

    groupDiv.appendChild(buttonsContainer);
    filtersContainer.appendChild(groupDiv);
  });
}

// ==========================================
// 3. دالة تطبيق الفلتر وتلوين الحروف
// ==========================================
function applyFilter(category, btnElement) {
  currentFilter = category;
  
  // إعادة ضبط تصميم كل الأزرار الفرعية
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('bg-gold-600', 'text-white', 'shadow-md', 'border-transparent');
    b.classList.add('bg-surface', 'border-gray-300', 'text-gray-700');
    // إزالة اللون المخصص إذا كان موجوداً
    b.style.backgroundColor = '';
    b.style.color = '';
  });

  // تمييز الزر المختار
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
  
  // حالة "إظهار الكل"
  if (category === 'all') {
    if(ruleBriefCard) ruleBriefCard.classList.add('hidden');
    allWords.forEach(w => {
      w.classList.remove('opacity-30', 'grayscale');
      if(w.dataset.originalText) w.innerHTML = w.dataset.originalText;
    });
    return;
  }

  // تحديث بطاقة الشرح الجانبية
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

  // تلوين الكلمات والحروف
  allWords.forEach(w => {
    // تخطي علامات الوقف أو أرقام الآيات
    if (!w.dataset.key && w.innerHTML.includes('﴿')) return;
    
    const wordKey = w.dataset.key;
    const rules = tajweedData[wordKey] || [];
    const targetRule = rules.find(r => r.type === category);

    // حفظ النص الأصلي إذا لم يكن محفوظاً مسبقاً
    if (!w.dataset.originalText) {
      w.dataset.originalText = w.textContent;
    }

    if (targetRule && targetRule.chars) {
      w.classList.remove('opacity-30', 'grayscale');
      
      // تقطيع الكلمة وتلوين الحروف المحددة فقط بناءً على الـ Index
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
      // الكلمة لا تحتوي على الحكم المطلوب
      w.innerHTML = w.dataset.originalText;
      w.classList.add('opacity-30', 'grayscale');
    }
  });
}

// ==========================================
// 4. دالة التهيئة (Initialization)
// ==========================================
// استدعِ هذه الدالة بعد جلب ملف الـ JSON ورسم الكلمات في الـ DOM
function initApp(fetchedData) {
  tajweedData = fetchedData;
  renderFilters();
}
