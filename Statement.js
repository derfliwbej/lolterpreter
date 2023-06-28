export class Statement {
}
(function (Statement) {
    class Program extends Statement {
        constructor(body) {
            super();
            this.body = body;
        }
        interpret(mapper) {
            return mapper.interpretProgramStatement(this);
        }
    }
    Statement.Program = Program;
    class Expression extends Statement {
        constructor(expression) {
            super();
            this.expression = expression;
        }
        interpret(mapper) {
            return mapper.interpretExpressionStatement(this);
        }
    }
    Statement.Expression = Expression;
    class Print extends Statement {
        constructor(expressions) {
            super();
            this.expressions = expressions;
        }
        interpret(mapper) {
            return mapper.interpretPrintStatement(this);
        }
    }
    Statement.Print = Print;
    class Input extends Statement {
        constructor(identifier) {
            super();
            this.identifier = identifier;
        }
        interpret(mapper) { return mapper.interpretInputStatement(this); }
    }
    Statement.Input = Input;
    class Variable extends Statement {
        constructor(identifier, value) {
            super();
            this.identifier = identifier;
            this.value = value;
        }
        interpret(mapper) {
            return mapper.interpretVariableStatement(this);
        }
    }
    Statement.Variable = Variable;
    class Reassign extends Statement {
        constructor(identifier, value) {
            super();
            this.identifier = identifier;
            this.value = value;
        }
        interpret(mapper) {
            return mapper.interpretReassignStatement(this);
        }
    }
    Statement.Reassign = Reassign;
    class TypeReassign extends Statement {
        constructor(identifier, type) {
            super();
            this.identifier = identifier;
            this.type = type;
        }
        interpret(mapper) {
            return mapper.interpretTypeReassignStatement(this);
        }
    }
    Statement.TypeReassign = TypeReassign;
    class If extends Statement {
        constructor(then_block, else_block) {
            super();
            this.then_block = then_block;
            this.else_block = else_block;
        }
        interpret(mapper) { return mapper.interpretIfStatement(this); }
    }
    Statement.If = If;
    class Switch extends Statement {
        constructor(cases, default_case) {
            super();
            this.cases = cases;
            this.default_case = default_case;
        }
        interpret(mapper) { return mapper.interpretSwitchStatement(this); }
    }
    Statement.Switch = Switch;
    class Loop extends Statement {
        constructor(code_block, label, operation, counter, type, expression) {
            super();
            this.code_block = code_block;
            this.label = label;
            this.operation = operation;
            this.counter = counter;
            this.type = type;
            this.expression = expression;
        }
        interpret(mapper) { return mapper.interpretLoopStatement(this); }
    }
    Statement.Loop = Loop;
    (function (Loop) {
        let LoopType;
        (function (LoopType) {
            LoopType[LoopType["TIL"] = 0] = "TIL";
            LoopType[LoopType["WILE"] = 1] = "WILE";
        })(LoopType = Loop.LoopType || (Loop.LoopType = {}));
    })(Loop = Statement.Loop || (Statement.Loop = {}));
})(Statement || (Statement = {}));
