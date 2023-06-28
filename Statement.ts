import { Expr } from './Expr.js';
import { Token } from './Token.js';

export abstract class Statement {
    abstract interpret<Type>(mapper: Statement.InterpretMapper<Type>): Type;
}

export namespace Statement {

    export class Program extends Statement {
        body: Array<Statement>

        constructor(body: Array<Statement>) {
            super();
            this.body = body;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type {
            return mapper.interpretProgramStatement(this);
        }
    }

    export class Expression extends Statement {
        expression: Expr;

        constructor(expression: Expr) {
            super();
            this.expression = expression;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type {
            return mapper.interpretExpressionStatement(this);
        }
    }

    export class Print extends Statement {
        expressions: Array<Expr>;

        constructor(expressions: Array<Expr>) {
            super();
            this.expressions = expressions;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type {
            return mapper.interpretPrintStatement(this);
        }
    }

    export class Input extends Statement {
        identifier: Token;

        constructor(identifier: Token) { 
            super();
            this.identifier = identifier; 
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type { return mapper.interpretInputStatement(this); }
    }

    export class Variable extends Statement {
        identifier: Token;
        value: Expr;

        constructor(identifier: Token, value: Expr) {
            super();
            this.identifier = identifier;
            this.value = value;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type {
            return mapper.interpretVariableStatement(this);
        }
    }

    export class Reassign extends Statement {
        identifier: Token;
        value: Expr;

        constructor(identifier: Token, value: Expr) {
            super();
            this.identifier = identifier;
            this.value = value;
        }

        interpret<Type>(mapper: InterpretMapper<Type>) {
            return mapper.interpretReassignStatement(this);
        }
    }

    export class TypeReassign extends Statement {
        identifier: Token;
        type: string;

        constructor(identifier: Token, type: string) {
            super();
            this.identifier = identifier;
            this.type = type;
        }
        
        interpret<Type>(mapper: InterpretMapper<Type>): Type {
            return mapper.interpretTypeReassignStatement(this);
        }
    }

    export class If extends Statement {
        then_block: Array<Statement>;
        else_block: Array<Statement>;

        constructor(then_block: Array<Statement>, else_block: Array<Statement>) {
            super();
            this.then_block = then_block;
            this.else_block = else_block;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type { return mapper.interpretIfStatement(this); }
    }

    export class Switch extends Statement {
        cases: Map<any, Array<Statement>>;
        default_case?: Array<Statement>;

        constructor(cases: Map<any, Array<Statement>>, default_case?: Array<Statement>) {
            super();
            this.cases = cases;
            this.default_case = default_case;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type { return mapper.interpretSwitchStatement(this); }
    }

    export class Loop extends Statement {
        code_block: Array<Statement>;
        label: Token;
        operation: Token;
        counter: Token;
        type: Loop.LoopType;
        expression: Expr;

        constructor(code_block: Array<Statement>, label: Token, operation: Token, counter: Token, type: Loop.LoopType, expression: Expr) {
            super();
            this.code_block = code_block;
            this.label = label;
            this.operation = operation;
            this.counter = counter;
            this.type = type;
            this.expression = expression;
        }

        interpret<Type>(mapper: InterpretMapper<Type>): Type { return mapper.interpretLoopStatement(this); }

    }

    export namespace Loop {
        export enum LoopType {
            TIL, WILE
        }
    }

    export interface InterpretMapper<Type> {
        interpretProgramStatement(statement: Program): Type;
        interpretExpressionStatement(statement: Expression): Type;
        interpretPrintStatement(statement: Print): Type;
        interpretInputStatement(statement: Input): Type;
        interpretVariableStatement(statement: Variable): Type;
        interpretReassignStatement(statement: Reassign): Type;
        interpretTypeReassignStatement(statement: TypeReassign): Type;
        interpretIfStatement(statement: If): Type;
        interpretSwitchStatement(statement: Switch): Type;
        interpretLoopStatement(statement: Loop): Type;
    }
}