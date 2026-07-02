import os

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Read files
    with open(os.path.join(base_dir, '.ⴰⵙⵏⵉⵏ/lexer.tifa'), 'r', encoding='utf-8') as f: lexer = f.read()
    with open(os.path.join(base_dir, '.ⴰⵙⵏⵉⵏ/parser.tifa'), 'r', encoding='utf-8') as f: parser = f.read()
    with open(os.path.join(base_dir, '.ⴰⵙⵏⵉⵏ/compiler.tifa'), 'r', encoding='utf-8') as f: compiler = f.read()
    with open(os.path.join(base_dir, '.ⴰⵙⵏⵉⵏ/vm.tifa'), 'r', encoding='utf-8') as f: vm = f.read()
    
    with open(os.path.join(base_dir, 'tifalang_std/ⴰⴼⴰⵢⵍⵓ.tifa'), 'r', encoding='utf-8') as f: afaylu = f.read()
    with open(os.path.join(base_dir, 'tifalang_std/ⴰⵎⵙⵏ.tifa'), 'r', encoding='utf-8') as f: amsn = f.read()
    with open(os.path.join(base_dir, 'tifalang_std/ⴰⵎⵣⵉⵔ.tifa'), 'r', encoding='utf-8') as f: amzir = f.read()
    
    # Read template
    with open(os.path.join(base_dir, 'playground/playground.template.js'), 'r', encoding='utf-8') as f: js = f.read()
    
    # Helper to escape for JS template strings
    def js_escape(s):
        return s.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
        
    # Replace placeholders
    js = js.replace('__LEXER_PY_PLACEHOLDER__', js_escape(lexer))
    js = js.replace('__PARSER_PY_PLACEHOLDER__', js_escape(parser))
    js = js.replace('__COMPILER_PY_PLACEHOLDER__', js_escape(compiler))
    js = js.replace('__VM_PY_PLACEHOLDER__', js_escape(vm))
    js = js.replace('__AFAYLU_TIFA_PLACEHOLDER__', js_escape(afaylu))
    js = js.replace('__AMSN_TIFA_PLACEHOLDER__', js_escape(amsn))
    js = js.replace('__AMZIR_TIFA_PLACEHOLDER__', js_escape(amzir))
    
    # Write to target
    with open(os.path.join(base_dir, 'playground/playground.js'), 'w', encoding='utf-8') as f:
        f.write(js)
        
    print("✓ Bundled engine into playground/playground.js successfully!")

if __name__ == '__main__':
    main()
