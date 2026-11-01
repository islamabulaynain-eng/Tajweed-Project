/**
 * Tajweed Processor
 * Handles mapping English rule keys back to Arabic UI labels and injecting CSS classes.
 */

const TajweedProcessor = {
    // 1. Mapping standard keys back to Arabic for tooltips/hover states
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

    /**
     * Renders a single word with HTML spans wrapping the characters that have rules.
     * 
     * @param {string} wordText - The actual Arabic text of the word (e.g., "بِسْمِ")
     * @param {Array} wordRules - The array of rules for this word from your JSON 
     * @returns {string} - HTML string with Tajweed spans applied
     */
    renderWordHTML(wordText, wordRules) {
        if (!wordRules || wordRules.length === 0) {
            return `<span>${wordText}</span>`;
        }

        // Split word into an array of characters (Array.from handles Unicode safely)
        const characters = Array.from(wordText);
        
        // Array to hold CSS classes for each character index
        const charClasses = new Array(characters.length).fill(null).map(() => []);
        const charTooltips = new Array(characters.length).fill(null).map(() => []);

        // Map the rules to the specific character indices
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

        // Rebuild the word with HTML spans
        let htmlOutput = "";
        let currentClasses = "";
        let currentGroupText = "";
        let currentTooltip = "";

        for (let i = 0; i < characters.length; i++) {
            const classesForChar = charClasses[i].join(" ");
            const tooltipForChar = charTooltips[i].join(" و "); // "and" in Arabic

            // If the CSS classes change, close the previous span and start a new one
            if (classesForChar !== currentClasses) {
                if (currentGroupText !== "") {
                    // Close previous span
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

        // Append the final group
        if (currentGroupText !== "") {
            htmlOutput += currentClasses 
                ? `<span class="${currentClasses}" title="${currentTooltip}">${currentGroupText}</span>`
                : `<span>${currentGroupText}</span>`;
        }

        return htmlOutput;
    }
};

// ==========================================
// EXAMPLE USAGE IN YOUR WEBSITE
// ==========================================

// Assume this is the JSON data fetched from your server (merged_tajweed.json)
const mergedTajweedData = {
    "17:1:1": [
        { "type": "hams", "chars": [1] },
        { "type": "madd_tabiee", "chars": [3] }
    ]
};

// Example function to display an Ayah
function displayAyah() {
    const wordKey = "17:1:1";
    const rawArabicWord = "سُبْحَانَ"; 
    
    const rulesForWord = mergedTajweedData[wordKey];
    
    // Generate the HTML
    const formattedHtml = TajweedProcessor.renderWordHTML(rawArabicWord, rulesForWord);
    
    // Inject into the DOM
    document.getElementById("quran-container").innerHTML = formattedHtml;
}
