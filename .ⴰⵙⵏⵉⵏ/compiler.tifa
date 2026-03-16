class Compiler:
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
