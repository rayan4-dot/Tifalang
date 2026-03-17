
const editor = document.getElementById('editor');
const output = document.getElementById('output');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');

// Latin to Tifinagh Mapper
const mapper = {
    'a': 'ⴰ', 'b': 'ⴱ', 'g': 'ⴳ', 'd': 'ⴷ', 'e': 'ⴻ', 'f': 'ⴼ', 'k': 'ⴽ', 
    'h': 'ⵀ', 'i': 'ⵉ', 'l': 'ⵍ', 'm': 'ⵎ', 'n': 'ⵏ', 'u': 'ⵓ', 'r': 'ⵔ', 
    's': 'ⵙ', 't': 'ⵜ', 'w': 'ⵡ', 'y': 'ⵢ', 'z': 'ⵣ', 'x': 'ⵅ', 'q': 'ⵇ',
    'j': 'ⵊ', 'v': 'ⵖ', 'c': 'ⵛ', 'p': 'ⵃ'
};

editor.addEventListener('input', (e) => {
    if (e.inputType === 'insertText') {
        const char = e.data.toLowerCase();
        if (mapper[char]) {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const text = editor.value;
            editor.value = text.slice(0, start - 1) + mapper[char] + text.slice(end);
            editor.selectionStart = editor.selectionEnd = start;
        }
    }
});

let pyodide;
const log = (msg, color = '') => {
    const span = document.createElement('span');
    span.textContent = msg + '\n';
    if (color) span.style.color = color;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
};

async function initPyodide() {
    log('⛰️  ⵜⴰⵡⵓⵔⵉ ⴰⵙⵏⵉⵏ (Initializing Engine)...', '#fdd835');
    pyodide = await loadPyodide();
    log('✓ Engine Loaded.', '#4caf50');
    
    // We will bundle the TifaLang engine files for Pyodide here.
    // For now, let's mock the run function until we can load real modules.
}

runBtn.addEventListener('click', async () => {
    const code = editor.value;
    if (!code) return;
    
    log('\n🚀 Running...', '#00d2ff');
    
    try {
        // Simple mock for demo purposes if pyodide isn't fully loaded with our VM yet
        if (code.includes('ⵙⵙⵓⴼⵖ "ⴰⵣⵓⵍ!"')) {
            log('ⴰⵣⵓⵍ!');
        } else {
            log('Code executed (Mock Mode). Actual TifaLang VM integration in progress...');
        }
    } catch (err) {
        log('Error: ' + err, '#ff5252');
    }
});

clearBtn.addEventListener('click', () => {
    output.innerHTML = '';
});

initPyodide();
