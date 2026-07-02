// --- BUNDLED ENGINE MODULES ---
const LEXER_PY = `__LEXER_PY_PLACEHOLDER__`;
const PARSER_PY = `__PARSER_PY_PLACEHOLDER__`;
const COMPILER_PY = `__COMPILER_PY_PLACEHOLDER__`;
const VM_PY = `__VM_PY_PLACEHOLDER__`;

// --- BUNDLED STANDARD LIBRARIES ---
const AFAYLU_TIFA = `__AFAYLU_TIFA_PLACEHOLDER__`;
const AMSN_TIFA = `__AMSN_TIFA_PLACEHOLDER__`;
const AMZIR_TIFA = `__AMZIR_TIFA_PLACEHOLDER__`;

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
    try {
        pyodide = await loadPyodide({
            stdout: (text) => { log(text); },
            stderr: (text) => { log(text, '#ff5252'); }
        });
        
        // Write the bundled files into Pyodide virtual filesystem
        pyodide.FS.writeFile('lexer.py', LEXER_PY);
        pyodide.FS.writeFile('parser.py', PARSER_PY);
        pyodide.FS.writeFile('compiler.py', COMPILER_PY);
        pyodide.FS.writeFile('vm.py', VM_PY);
        
        // Create standard library directory structure and write std lib files
        pyodide.FS.mkdirTree('/usr/local/share/tifalang');
        pyodide.FS.writeFile('/usr/local/share/tifalang/ⴰⴼⴰⵢⵍⵓ.tifa', AFAYLU_TIFA);
        pyodide.FS.writeFile('/usr/local/share/tifalang/ⴰⵎⵙⵏ.tifa', AMSN_TIFA);
        pyodide.FS.writeFile('/usr/local/share/tifalang/ⴰⵎⵣⵉⵔ.tifa', AMZIR_TIFA);

        // Set up the Python execution wrapper
        pyodide.runPython(`
from lexer import lex
from parser import Parser, ParserError
from compiler import Compiler
from vm import VM, VMRuntimeError

def run_tifa(code):
    try:
        tokens = lex(code)
        parser = Parser(tokens)
        stmts = parser.parse()
        
        compiler = Compiler()
        for stmt in stmts:
            compiler.compile(stmt)
        
        bytecode, line_map = compiler.get_bytecode()
        
        vm = VM()
        vm.run(bytecode, line_map)
    except ParserError as e:
        print(f"SyntaxError: {e}")
    except VMRuntimeError as e:
        print(f"RuntimeError: {e}")
    except Exception as e:
        print(f"Error: {e}")
`);

        log('✓ Engine Loaded.', '#4caf50');
    } catch (err) {
        log('❌ Failed to initialize TifaLang Engine: ' + err.message, '#ff5252');
    }
}

runBtn.addEventListener('click', async () => {
    const code = editor.value;
    if (!code) return;
    
    if (!pyodide) {
        log('⚠ Engine not initialized yet. Please wait...', '#ff5252');
        return;
    }
    
    log('\n🚀 Running...', '#00d2ff');
    
    try {
        pyodide.globals.set('code_to_run', code);
        pyodide.runPython('run_tifa(code_to_run)');
    } catch (err) {
        log('Execution Error: ' + err, '#ff5252');
    }
});

clearBtn.addEventListener('click', () => {
    output.innerHTML = '';
});

initPyodide();
