// --- BUNDLED ENGINE MODULES ---
const LEXER_PY = `import re

token_specification = [
    ('COMMENT',  r'#[^\\n]*'),
    ('NUMBER',   r'\\d+'),
    ('STRING',   r'"[^"]*"|\\'[^\\']*\\''),
    ('PRINT',    r'ⵙⵙⵓⴼⵖ'),
    ('WHILE',    r'ⵉⵎⴰ'),
    ('FUNC',     r'ⵜⴰⵡⵓⵔⵉ'),
    ('IMPORT',   r'ⴰⵡⵡ'),
    ('AS',       r'ⵓⴳⴳ'),
    ('ELSE',     r'ⵎⴰⵢⴰ'),
    ('IF',       r'ⵎⴰ'),
    ('LBRACE',   r'\\{'),
    ('RBRACE',   r'\\}'),
    ('LBRACK',   r'\\['),
    ('RBRACK',   r'\\]'),
    ('COMMA',    r','),
    ('COLON',    r':'),
    ('LPAREN',   r'\\('),
    ('RPAREN',   r'\\)'),
    ('EQEQ',     r'=='),
    ('EQ',       r'='),
    ('LT',       r'<'),
    ('GT',       r'>'),
    ('PLUS',     r'\\+'),
    ('MINUS',    r'-'),
    ('MUL',      r'\\*'),
    ('DIV',      r'/'),
    ('IDENT',    r'[\\u2D30-\\u2D7F][\\u2D30-\\u2D7F0-9_]*'),
    ('NEWLINE',  r'\\n'),
    ('SKIP',     r'[ \\t\\r]+'),
    ('MISMATCH', r'.'),
]

tok_regex = '|'.join('(?P<%s>%s)' % pair for pair in token_specification)

def lex(code):
    tokens = []
    line_num = 1
    line_start = 0
    for mo in re.finditer(tok_regex, code):
        kind = mo.lastgroup
        value = mo.group()
        if kind == 'NEWLINE':
            line_starting = mo.end()
            line_num += 1
            continue
        elif kind == 'SKIP' or kind == 'COMMENT':
            continue
        elif kind == 'MISMATCH':
            raise RuntimeError(f'Unexpected character {value!r} on line {line_num}')
        else:
            if kind == 'STRING':
                value = value[1:-1]
            elif kind == 'NUMBER':
                value = int(value)
            tokens.append((kind, value, line_num))
    tokens.append(('EOF', 'EOF', line_num))
    return tokens
`;
const PARSER_PY = `class ParserError(Exception):
    pass

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self):
        return self.tokens[self.pos]

    def consume(self, expected_kind=None):
        kind, value, line = self.tokens[self.pos]
        if expected_kind and kind != expected_kind:
            raise ParserError(f'Line {line}: Expected {expected_kind}, got {kind}')
        self.pos += 1
        return value, line

    def parse(self):
        stmts = []
        while self.peek()[0] != 'EOF':
            stmts.append(self.parse_statement())
        return stmts

    def parse_statement(self):
        kind, _, line = self.peek()
        if kind == 'PRINT':
            self.consume('PRINT')
            expr = self.parse_expression()
            return ('print', expr, line)
        elif kind == 'IF':
            self.consume('IF')
            cond = self.parse_expression()
            self.consume('LBRACE')
            if_body = self.parse_block()
            self.consume('RBRACE')
            else_body = []
            if self.peek()[0] == 'ELSE':
                self.consume('ELSE')
                self.consume('LBRACE')
                else_body = self.parse_block()
                self.consume('RBRACE')
            return ('if', cond, if_body, else_body, line)
        elif kind == 'WHILE':
            self.consume('WHILE')
            cond = self.parse_expression()
            self.consume('LBRACE')
            body = self.parse_block()
            self.consume('RBRACE')
            return ('while', cond, body, line)
        elif kind == 'FUNC':
            self.consume('FUNC')
            name, fn_line = self.consume('IDENT')
            params = []
            if self.peek()[0] == 'LPAREN':
                self.consume('LPAREN')
                if self.peek()[0] != 'RPAREN':
                    params.append(self.consume('IDENT')[0])
                    while self.peek()[0] == 'COMMA':
                        self.consume('COMMA')
                        params.append(self.consume('IDENT')[0])
                self.consume('RPAREN')
            self.consume('LBRACE')
            body = self.parse_block()
            self.consume('RBRACE')
            return ('function', name, params, body, fn_line)
        elif kind == 'IMPORT':
            self.consume('IMPORT')
            name, name_line = self.consume('IDENT')
            alias = None
            if self.peek()[0] == 'AS':
                self.consume('AS')
                alias, _ = self.consume('IDENT')
            return ('import', name, alias, name_line)
        elif kind == 'IDENT':
            # Peek ahead to see if it's an assignment
            name, id_line = self.consume('IDENT')
            
            # Case 1: Simple assignment name = expr
            if self.peek()[0] == 'EQ':
                self.consume('EQ')
                expr = self.parse_expression()
                return ('assign', name, expr, id_line)
            
            # Case 2: Indexed assignment name[key] = expr OR indexed access call name[key]()
            elif self.peek()[0] == 'LBRACK':
                # We need to distinguish name[key] = val from name[key]()
                # For simplicity, we'll try to parse the index and then check for EQ
                self.consume('LBRACK')
                key = self.parse_expression()
                self.consume('RBRACK')
                
                if self.peek()[0] == 'EQ':
                    self.consume('EQ')
                    val = self.parse_expression()
                    return ('store_subscript', name, key, val, id_line)
                else:
                    # It was likely name[key]()... continue parsing as expression
                    expr = ('binary_subscript', ('ident', name, id_line), key, id_line)
                    # Now handle possible calls or more indexing in parse_primary's style
                    while True:
                        if self.peek()[0] == 'LPAREN':
                            self.consume('LPAREN')
                            args = []
                            if self.peek()[0] != 'RPAREN':
                                args.append(self.parse_expression())
                                while self.peek()[0] == 'COMMA':
                                    self.consume('COMMA')
                                    args.append(self.parse_expression())
                            self.consume('RPAREN')
                            expr = ('call', expr, args, id_line)
                        elif self.peek()[0] == 'LBRACK':
                            self.consume('LBRACK')
                            k = self.parse_expression()
                            self.consume('RBRACK')
                            expr = ('binary_subscript', expr, k, id_line)
                        else:
                            break
                    return ('expr_stmt', expr, id_line)
            
            # Case 3: Just an expression starting with an identifier (like a function call)
            else:
                # Reset name and re-parse as expression for maximum correctness
                self.pos -= 1 # Rewind name
                expr = self.parse_expression()
                return ('expr_stmt', expr, id_line)
        elif kind in ('NUMBER', 'STRING', 'LBRACK', 'LBRACE', 'LPAREN'):
            expr = self.parse_expression()
            return ('expr_stmt', expr, line)
        else:
            raise ParserError(f'Line {line}: Unexpected token {kind} in statement')

    def parse_block(self):
        stmts = []
        while self.peek()[0] not in ('RBRACE', 'EOF'):
            stmts.append(self.parse_statement())
        return stmts

    def parse_expression(self):
        return self.parse_equality()

    def parse_equality(self):
        left = self.parse_term()
        kind, _, _ = self.peek()
        if kind in ('EQEQ', 'LT', 'GT'):
            self.consume(kind)
            right = self.parse_term()
            line = left[2] if len(left) > 2 and isinstance(left, tuple) else 0
            return ('binop', kind, left, right, line)
        return left

    def parse_term(self):
        left = self.parse_factor()
        while self.peek()[0] in ('PLUS', 'MINUS'):
            kind, _, _ = self.peek()
            self.consume(kind)
            right = self.parse_factor()
            line = left[2] if len(left) > 2 and isinstance(left, tuple) else 0
            left = ('binop', kind, left, right, line)
        return left

    def parse_factor(self):
        left = self.parse_primary()
        while self.peek()[0] in ('MUL', 'DIV'):
            kind, _, _ = self.peek()
            self.consume(kind)
            right = self.parse_primary()
            line = left[2] if len(left) > 2 and isinstance(left, tuple) else 0
            left = ('binop', kind, left, right, line)
        return left

    def parse_primary(self):
        kind, val, line = self.peek()
        if kind == 'NUMBER':
            self.consume('NUMBER')
            return ('number', val, line)
        elif kind == 'STRING':
            self.consume('STRING')
            return ('string', val, line)
        elif kind == 'IDENT':
            name, id_line = self.consume('IDENT')
            res = ('ident', name, id_line)
            # Handle possible trailing access like name[key] or name()
            while True:
                if self.peek()[0] == 'LPAREN':
                    self.consume('LPAREN')
                    args = []
                    if self.peek()[0] != 'RPAREN':
                        args.append(self.parse_expression())
                        while self.peek()[0] == 'COMMA':
                            self.consume('COMMA')
                            args.append(self.parse_expression())
                    self.consume('RPAREN')
                    res = ('call', name if isinstance(res, tuple) and res[0]=='ident' else res, args, id_line)
                elif self.peek()[0] == 'LBRACK':
                    self.consume('LBRACK')
                    key = self.parse_expression()
                    self.consume('RBRACK')
                    res = ('binary_subscript', res, key, id_line)
                else:
                    break
            return res
        elif kind == 'LBRACK':
            self.consume('LBRACK')
            elements = []
            if self.peek()[0] != 'RBRACK':
                elements.append(self.parse_expression())
                while self.peek()[0] == 'COMMA':
                    self.consume('COMMA')
                    elements.append(self.parse_expression())
            self.consume('RBRACK')
            return ('list', elements, line)
        elif kind == 'LBRACE':
            self.consume('LBRACE')
            pairs = []
            if self.peek()[0] != 'RBRACE':
                k = self.parse_expression()
                self.consume('COLON')
                v = self.parse_expression()
                pairs.append((k, v))
                while self.peek()[0] == 'COMMA':
                    self.consume('COMMA')
                    k = self.parse_expression()
                    self.consume('COLON')
                    v = self.parse_expression()
                    pairs.append((k, v))
            self.consume('RBRACE')
            return ('dict', pairs, line)
        elif kind == 'LPAREN':
            self.consume('LPAREN')
            expr = self.parse_expression()
            self.consume('RPAREN')
            return expr
        else:
            raise ParserError(f'Line {line}: Unexpected token {kind} in expression')
`;
const COMPILER_PY = `class Compiler:
    def __init__(self):
        self.code = []
        # Support for patching jump addresses
        self.line_map = {} # instruction index -> line number

    def emit(self, instr, line=0):
        self.code.append(instr)
        if line:
            self.line_map[len(self.code) - 1] = line

    def compile(self, node):
        if not isinstance(node, tuple):
            return

        t = node[0]
        # Most nodes follow (type, val1, val2, ..., line)
        line = node[-1] if isinstance(node[-1], int) else 0

        if t == 'number':
            self.emit(('LOAD_CONST', node[1]), line)
        elif t == 'string':
            self.emit(('LOAD_CONST', node[1]), line)
        elif t == 'list':
            for item in node[1]:
                self.compile(item)
            self.emit(('BUILD_LIST', len(node[1])), line)
        elif t == 'ident':
            self.emit(('LOAD_VAR', node[1]), line)
        elif t == 'binop':
            # Constant Folding optimization
            if node[2][0] == 'number' and node[3][0] == 'number':
                a = node[2][1]
                b = node[3][1]
                op = node[1]
                if op == 'PLUS': val = a + b
                elif op == 'MINUS': val = a - b
                elif op == 'MUL': val = a * b
                elif op == 'DIV': val = a / b
                else: val = None
                
                if val is not None:
                    self.emit(('LOAD_CONST', val), line)
                    return

            self.compile(node[2]) 
            self.compile(node[3])
            op_map = {
                'PLUS': 'BINARY_ADD', 'MINUS': 'BINARY_SUB', 
                'MUL': 'BINARY_MUL', 'DIV': 'BINARY_DIV',
                'EQEQ': 'BINARY_EQ', 'LT': 'BINARY_LT', 'GT': 'BINARY_GT'
            }
            op = op_map.get(node[1])
            self.emit((op,), line)
        elif t == 'assign':
            self.compile(node[2])
            self.emit(('STORE_VAR', node[1]), line)
        elif t == 'store_subscript':
            # name, key, val, line
            self.compile(node[2]) # key
            self.compile(node[3]) # val
            self.emit(('STORE_SUBSCRIPT', node[1]), line)
        elif t == 'binary_subscript':
            # obj, key, line
            self.compile(node[1]) # obj
            self.compile(node[2]) # key
            self.emit(('BINARY_SUBSCRIPT',), line)
        elif t == 'dict':
            # pairs, line
            for k, v in node[1]:
                self.compile(k)
                self.compile(v)
            self.emit(('BUILD_MAP', len(node[1])), line)
        elif t == 'print':
            self.compile(node[1])
            self.emit(('PRINT',), line)
        elif t == 'if':
            # cond, if_body, else_body, line
            self.compile(node[1])
            else_jump_idx = len(self.code)
            self.emit(('JUMP_IF_FALSE', None), line)
            
            for stmt in node[2]:
                self.compile(stmt)
            
            end_jump_idx = len(self.code)
            self.emit(('JUMP', None), line)
            
            # Patch else jump
            self.code[else_jump_idx] = ('JUMP_IF_FALSE', len(self.code))
            
            for stmt in node[3]:
                self.compile(stmt)
            
            # Patch end jump
            self.code[end_jump_idx] = ('JUMP', len(self.code))
            
        elif t == 'while':
            # cond, body, line
            loop_start = len(self.code)
            self.compile(node[1])
            
            exit_jump_idx = len(self.code)
            self.emit(('JUMP_IF_FALSE', None), line)
            
            for stmt in node[2]:
                self.compile(stmt)
            
            self.emit(('JUMP', loop_start), line)
            
            # Patch exit jump
            self.code[exit_jump_idx] = ('JUMP_IF_FALSE', len(self.code))
            
        elif t == 'function':
            # name, params, body, line
            fn_compiler = Compiler()
            for stmt in node[3]:
                fn_compiler.compile(stmt)
            fn_compiler.emit(('RETURN',), line)
            
            self.emit(('STORE_FUNC', node[1], node[2], fn_compiler.code), line)
            
        elif t == 'call':
            # name, args, line
            if isinstance(node[1], str):
                for arg in node[2]:
                    self.compile(arg)
                self.emit(('CALL', node[1], len(node[2])), line)
            else:
                self.compile(node[1]) # Put function on stack deep
                for arg in node[2]:
                    self.compile(arg)
                self.emit(('CALL_STACK', len(node[2])), line)
            
        elif t == 'import':
            # name, alias, line
            self.emit(('IMPORT', node[1], node[2]), line)
            
        elif t == 'expr_stmt':
            self.compile(node[1])
            self.emit(('POP',), line)
            
        else:
            raise RuntimeError(f"Compiler Error: Unknown node type {t}")

    def get_bytecode(self):
        return self.code, self.line_map
`;
const VM_PY = `
import random
import os
import json
import sys
import urllib.request
import pkgutil

class VMRuntimeError(Exception):
    def __init__(self, message, line=0):
        super().__init__(message)
        self.line = line

class VM:
    def __init__(self):
        self.stack = []
        self.env = {}
        self.funcs = {}
        self.builtins = {
            'ⵜⵉⵖⵣⵉ': len,
            'ⴰⵏⴰⵡ': lambda x: type(x).__name__,
            'ⴰⴳⴰⵔ': lambda: random.random(),
            'ⴰⵖⵔ': self._read_file,
            'ⴰⵔⴰ': self._write_file,
            'ⵉⵎⵙⴽⵉⵔⵏ': lambda: sys.argv[2:] if len(sys.argv) > 2 else [],
            'ⵙⵙⵓⴼⵖ_ⴰⵎⵙⵏ': json.loads,
            'ⵙⵙⵖⵔ_ⴰⵎⵙⵏ': json.dumps,
            'ⴰⴳⴳ': self._http_get,
            'ⵜⵉⴹⴰⴼ': self._trace,
            'ⵜⴰⵙⵎⵓⵏⵉ': self._stack
        }
        self._ip = 0
        self.debug_mode = "--debug" in sys.argv

    def _do_call(self, fn, args, line, line_map):
        if isinstance(fn, str):
            if fn in self.builtins:
                res = self.builtins[fn](*args)
                self.stack.append(res)
            elif fn in self.funcs:
                params, f_code = self.funcs[fn]
                old_env = self.env.copy()
                for i in range(min(len(params), len(args))):
                    self.env[params[i]] = args[i]
                self.run(f_code, line_map)
                self.env = old_env
                self.stack.append(None)
            else:
                raise VMRuntimeError(f"Undefined function '{fn}'", line)
        elif isinstance(fn, tuple) and len(fn) == 2:
            params, f_code = fn
            old_env = self.env.copy()
            for i in range(min(len(params), len(args))):
                self.env[params[i]] = args[i]
            self.run(f_code, line_map)
            self.env = old_env
            self.stack.append(None)
        else:
            raise VMRuntimeError(f"Object {fn} is not callable", line)

    def _trace(self):
        print(f"DEBUG TRACE: IP={self._ip}")

    def _stack(self):
        print(f"DEBUG STACK: {self.stack}")

    def _read_file(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def _write_file(self, path, content):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(str(content))
        return None

    def _http_get(self, url):
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')

    def run(self, code, line_map=None):
        if line_map is None:
            line_map = {}
            
        ip = 0
        while ip < len(code):
            instr = code[ip]
            current_line = line_map.get(ip, 0)
            self._ip = ip
            
            if self.debug_mode:
                print(f"[{current_line:3}] INSTR: {instr}")

            ip += 1
            op = instr[0]

            try:
                if op == 'LOAD_CONST':
                    self.stack.append(instr[1])
                elif op == 'POP':
                    self.stack.pop()
                elif op == 'BUILD_MAP':
                    n = instr[1]
                    d = {}
                    pairs = []
                    for _ in range(n):
                        v = self.stack.pop()
                        k = self.stack.pop()
                        pairs.append((k, v))
                    pairs.reverse()
                    for k, v in pairs:
                        d[k] = v
                    self.stack.append(d)
                elif op == 'BINARY_SUBSCRIPT':
                    key = self.stack.pop(); obj = self.stack.pop()
                    self.stack.append(obj[key])
                elif op == 'STORE_SUBSCRIPT':
                    name = instr[1]
                    val = self.stack.pop(); key = self.stack.pop()
                    if name in self.env and isinstance(self.env[name], dict):
                        self.env[name][key] = val
                    else:
                        raise VMRuntimeError(f"Cannot perform indexed assignment on non-dictionary '{name}'", current_line)
                elif op == 'LOAD_VAR':
                    name = instr[1]
                    if name in self.env:
                        self.stack.append(self.env[name])
                    elif name in self.funcs:
                        self.run(self.funcs[name], line_map)
                        self.stack.append(None)
                    elif name in self.builtins:
                        self.stack.append(('builtin', name))
                    else:
                        raise VMRuntimeError(f"Undefined variable '{name}'", current_line)
                elif op == 'STORE_VAR':
                    self.env[instr[1]] = self.stack.pop()
                elif op == 'BUILD_LIST':
                    n = instr[1]
                    lst = [self.stack.pop() for _ in range(n)]
                    lst.reverse()
                    self.stack.append(lst)
                elif op == 'BINARY_ADD':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a + b)
                elif op == 'BINARY_SUB':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a - b)
                elif op == 'BINARY_MUL':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a * b)
                elif op == 'BINARY_DIV':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a / b)
                elif op == 'BINARY_EQ':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a == b)
                elif op == 'BINARY_LT':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a < b)
                elif op == 'BINARY_GT':
                    b = self.stack.pop(); a = self.stack.pop()
                    self.stack.append(a > b)
                elif op == 'PRINT':
                    print(self.stack.pop())
                elif op == 'JUMP':
                    ip = instr[1]
                elif op == 'JUMP_IF_FALSE':
                    val = self.stack.pop()
                    if not val:
                        ip = instr[1]
                elif op == 'STORE_FUNC':
                    self.funcs[instr[1]] = (instr[2], instr[3])
                elif op == 'CALL':
                    name = instr[1]
                    nargs = instr[2]
                    args = [self.stack.pop() for _ in range(nargs)]
                    args.reverse()
                    self._do_call(name, args, current_line, line_map)
                elif op == 'CALL_STACK':
                    nargs = instr[1]
                    args = [self.stack.pop() for _ in range(nargs)]
                    args.reverse()
                    fn_obj = self.stack.pop()
                    self._do_call(fn_obj, args, current_line, line_map)
                elif op == 'IMPORT':
                    name = instr[1]
                    alias = instr[2]
                    
                    m_code = None
                    file_name = f"{name}.tifa"
                    
                    if os.path.exists(file_name):
                        with open(file_name, 'r', encoding='utf-8') as f:
                            m_code = f.read()
                    else:
                        sys_path = os.path.join("/usr/local/share/tifalang", file_name)
                        if os.path.exists(sys_path):
                            with open(sys_path, 'r', encoding='utf-8') as f:
                                m_code = f.read()
                        else:
                            data = pkgutil.get_data('tifalang_std', file_name)
                            if data:
                                m_code = data.decode('utf-8')
                    
                    if m_code:
                        from lexer import lex
                        from parser import Parser
                        from compiler import Compiler
                        m_tokens = lex(m_code)
                        m_ast = Parser(m_tokens).parse()
                        m_compiler = Compiler()
                        for s in m_ast: m_compiler.compile(s)
                        m_bc, m_lm = m_compiler.get_bytecode()
                        
                        if alias:
                            m_vm = VM()
                            m_vm.run(m_bc, m_lm)
                            module_dict = m_vm.env.copy()
                            module_dict.update(m_vm.funcs)
                            self.env[alias] = module_dict
                        else:
                            self.run(m_bc, m_lm)
                    else:
                        raise VMRuntimeError(f"Module '{name}' not found", current_line)
                elif op == 'RETURN':
                    return
            except Exception as e:
                if isinstance(e, VMRuntimeError):
                    raise e
                raise VMRuntimeError(f"{str(e)}", current_line)
`;

// --- BUNDLED STANDARD LIBRARIES ---
const AFAYLU_TIFA = `# ⴰⴼⴰⵢⵍⵓ (File System) Standard Library
# ⵜⵉⴼⴰⵍⴰⵏⴳ ⴰⵙⵏⵉⵏ ⴰⵎⴰⵣⵉⵖ

ⵜⴰⵡⵓⵔⵉ ⴰⵖⵔ_ⴰⴼⴰⵢⵍⵓ(ⵯ) {
    # ⴰⵖⵔ is the renamed 'read' built-in
    ⴰⵙⵏ = ⴰⵖⵔ(ⵯ)
    ⵎⴰⵢⴰ ⴰⵙⵏ
}

ⵜⴰⵡⵓⵔⵉ ⴰⵔⴰ_ⴰⴼⴰⵢⵍⵓ(ⵯ, ⵜ) {
    ⴰⵔⴰ(ⵯ, ⵜ)
}
`;
const AMSN_TIFA = `# ⴰⵎⵙⵏ (JSON) Standard Library
# ⵜⵉⴼⴰⵍⴰⵏⴳ ⴰⵙⵏⵉⵏ ⴰⵎⴰⵣⵉⵖ

ⵜⴰⵡⵓⵔⵉ ⵙⵙⵓⴼⵖ(ⵜ) {
    ⵎⴰⵢⴰ ⵙⵙⵓⴼⵖ_ⴰⵎⵙⵏ(ⵜ)
}

ⵜⴰⵡⵓⵔⵉ ⵙⵙⵖⵔ(ⴷ) {
    ⵎⴰⵢⴰ ⵙⵙⵖⵔ_ⴰⵎⵙⵏ(ⴷ)
}
`;
const AMZIR_TIFA = `# ⴰⵎⵣⵉⵔ (HTTP) Standard Library
# ⵜⵉⴼⴰⵍⴰⵏⴳ ⴰⵙⵏⵉⵏ ⴰⵎⴰⵣⵉⵖ

ⵜⴰⵡⵓⵔⵉ ⴰⴳⴳ_ⴰⵎⵣⵉⵔ(ⵉ) {
    ⵎⴰⵢⴰ ⴰⴳⴳ(ⵉ)
}
`;

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
