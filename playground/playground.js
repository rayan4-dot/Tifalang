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
      