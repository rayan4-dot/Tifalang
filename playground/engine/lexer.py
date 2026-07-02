import re

token_specification = [
    ('COMMENT',  r'#[^\n]*'),
    ('NUMBER',   r'\d+'),
    ('STRING',   r'"[^"]*"|\'[^\']*\''),
    ('PRINT',    r'ⵙⵙⵓⴼⵖ'),
    ('WHILE',    r'ⵉⵎⴰ'),
    ('FUNC',     r'ⵜⴰⵡⵓⵔⵉ'),
    ('IMPORT',   r'ⴰⵡⵡ'),
    ('AS',       r'ⵓⴳⴳ'),
    ('ELSE',     r'ⵎⴰⵢⴰ'),
    ('IF',       r'ⵎⴰ'),
    ('LBRACE',   r'\{'),
    ('RBRACE',   r'\}'),
    ('LBRACK',   r'\['),
    ('RBRACK',   r'\]'),
    ('COMMA',    r','),
    ('COLON',    r':'),
    ('LPAREN',   r'\('),
    ('RPAREN',   r'\)'),
    ('EQEQ',     r'=='),
    ('EQ',       r'='),
    ('LT',       r'<'),
    ('GT',       r'>'),
    ('PLUS',     r'\+'),
    ('MINUS',    r'-'),
    ('MUL',      r'\*'),
    ('DIV',      r'/'),
    ('IDENT',    r'[\u2D30-\u2D7F][\u2D30-\u2D7F0-9_]*'),
    ('NEWLINE',  r'\n'),
    ('SKIP',     r'[ \t\r]+'),
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
