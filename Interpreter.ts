// TODO: How to implement float data type in lolcode through javascript

import { Expr } from "./Expr.js";
import { Statement } from "./Statement.js";
import { SymbolTable } from "./SymbolTable.js";
import { RuntimeError } from "./RuntimeError.js";
import { Main } from "./Main.js";
import { Token } from "./Token.js";

export class Interpreter implements Expr.InterpretMapper<Object>, Statement.InterpretMapper<void> {
    private symbol_table: SymbolTable = new SymbolTable();
    private line: number = 1;

    public interpret(statements: Array<Statement>): void {
        try {
            for(var statement of statements) {
                this.line++;
                this.execute(statement);
            }
        } catch (e: any) {
            Main.runtimeError(e);
        }
    }

    private execute(statement: Statement): void { statement.interpret(this); }

    private evaluate(expression: Expr): any {
        if(expression == null) return null;
        return expression.interpret(this);
    }

    public interpretProgramStatement(statement: Statement.Program): void {
        this.interpret(statement.body);
        return null;
    }

    public interpretArithmeticBinaryExpr(expression: Expr.Binary): any {
        var left: any = this.evaluate(expression.left);
        var right: any = this.evaluate(expression.right);

        // Check if operands exist
        if(left == null || right == null) {
            throw new RuntimeError(expression.operator.getLine(), "Cannot perform operation on NOOB");
        }

        // Convert string operands to integer/double type
        if(typeof left === "string") {
            if(this.matchesInteger(left)) left = this.toInteger(expression.operator, left);
            else if(this.matchesDouble(left)) left = this.toDouble(expression.operator, left);
            else throw new RuntimeError(expression.operator.getLine(), "Cannot cast YARN literal '" + left + "' into NUMBR or NUMBAR literal");
        }
        if(typeof right === "string") {
            if(this.matchesInteger(right)) right = this.toInteger(expression.operator, right);
            else if(this.matchesDouble(right)) right = this.toDouble(expression.operator, right);
            else throw new RuntimeError(expression.operator.getLine(), "Cannot cast YARN literal '" + right + "' into NUMBR or NUMBAR literal");
        }

        // Convert booleans to integer type
        if(typeof left === "boolean")
            left = this.toInteger(expression.operator, left);
        if(typeof right === "boolean")
            right = this.toInteger(expression.operator, right);

        switch(expression.operator.getType()) {
            case Token.ADDITION_OPERATOR: return left + right;
            case Token.SUBTRACTION_OPERATOR: return left - right;
            case Token.MULTIPLICATION_OPERATOR: return left * right;
            case Token.DIVISION_OPERATOR: return left / right;
            case Token.MODULO_OPERATOR: return left % right;
            case Token.MAX_OPERATOR: return Math.max(left, right);
            case Token.MIN_OPERATOR: return Math.min(left, right);
        }

        // Unreachable
        return null;
    }

    public interpretLogicalBinaryExpr(expression: Expr.Binary): any {
        var left: any = this.evaluate(expression.left);
        var right: any = this.evaluate(expression.right);

        left = this.toBoolean(left);
        right = this.toBoolean(right);

        switch(expression.operator.getType()) {
            case Token.AND_OPERATOR: return Boolean(left) && Boolean(right);
            case Token.OR_OPERATOR: return Boolean(left) || Boolean(right);
            case Token.XOR_OPERATOR: return Boolean(left) !== Boolean(right);
        }

        // Unreachable
        return null;
    }

    public interpretUnaryExpr(expression: Expr.Unary): any {
        var operand: any = this.evaluate(expression.operand);

        if(expression.operator.getType() === Token.NOT_OPERATOR) {
            return !this.toBoolean(operand);
        }

        return null;
    }

    public interpretLiteralExpr(expression: Expr.Literal): any {
        return expression.value;
    }

    public interpretComparisonExpr(expression: Expr.Binary): any {
        var left: any = this.evaluate(expression.left);
        var right: any = this.evaluate(expression.right);
        if(typeof left !== "number" || typeof right !== "number") throw new RuntimeError(expression.operator.getLine(), "Operands must be of NUMBR or NUMBAR type");

        switch(expression.operator.getType()) {
            case Token.EQUAL_OPERATOR: return left == right;
            case Token.NOT_EQUAL_OPERATOR: return left != right;
        }

        // Unreachable
        return null;
    }

    public interpretTypecastExpr(expression: Expr.Typecast): any {
        var operand: any = this.evaluate(expression.operand);

        switch(expression.type.getType()) {
            case Token.INTEGER_TYPE: return this.toInteger(expression.type, operand);
            case Token.DOUBLE_TYPE: return this.toDouble(expression.type, operand);
            case Token.STRING_TYPE: return this.toString(expression.type, operand);
            case Token.BOOLEAN_TYPE: return this.toBoolean(operand);
        }

        // Unreachable
        return null;
    }

    public interpretIdentifierExpr(expression: Expr.Identifier): any {
        return this.symbol_table.get(expression.name.getLine(), expression.name.getLexeme());
    }

    public interpretInfiniteExpr(expression: Expr.Infinite): any {
        var operands: Array<Expr> = expression.operands;

        switch(expression.operator.getType()) {
            case Token.AND_MANY:
                for(var operand of operands) {
                    if(!this.toBoolean(this.evaluate(operand))) return false;
                }
                return true;
            case Token.OR_MANY:
                for(var operand of operands) {
                    if(this.toBoolean(this.evaluate(operand))) return true;
                }
                return false;
            case Token.CONCATENATION:
                var string: string = "";
                for(var operand of operands) {
                    string = string + this.toString(expression.operator, this.evaluate(operand));
                }
                return string;
        }

        // Unreachable
        return null;
    }

    public interpretExpressionStatement(statement: Statement.Expression): void {
        this.symbol_table.reassign("IT", this.evaluate(statement.expression));
        return null;
    }

    public interpretPrintStatement(statement: Statement.Print): void {
        var operands: Array<Expr> = statement.expressions;
        var output: string = "";
        for(var expression of operands) {
            var result: any = this.evaluate(expression);
            output = output + this.toString(new Token(this.line, null, null), result);
        }

        Main.consoleLog(output);
        return null;
    }

    public interpretInputStatement(statement: Statement.Input): void {
        var identifier: string = statement.identifier.getLexeme();

        if(!this.symbol_table.containsKey(identifier)) throw new RuntimeError(statement.identifier.getLine(), "Variable '" + identifier + "' is not declared");

        let value = Main.getInput("Enter value", `Please enter value for variable ${statement.identifier.getLexeme()}`);

        this.symbol_table.assign(this.line, identifier, value);

        return null;
    }

    public interpretVariableStatement(statement: Statement.Variable): void {
        var line: number = statement.identifier.getLine();
        var name: string = statement.identifier.getLexeme();
        var value: any = this.evaluate(statement.value);

        this.symbol_table.assign(line, name, value);

        return null;
    }

    public interpretReassignStatement(statement: Statement.Reassign): void {
        var name: string = statement.identifier.getLexeme();
        var value: any = this.evaluate(statement.value);

        this.symbol_table.reassign(name, value);

        return null;
    }

    public interpretTypeReassignStatement(statement: Statement.TypeReassign): void {
        var name: string = statement.identifier.getLexeme();
        var value: any = this.symbol_table.get(this.line, name);

        switch(statement.type) {
            case Token.INTEGER_TYPE:
                this.symbol_table.reassign(name, this.toInteger(statement.identifier, value));
                break;
            case Token.DOUBLE_TYPE:
                this.symbol_table.reassign(name, this.toDouble(statement.identifier, value));
                break;
            case Token.STRING_TYPE:
                this.symbol_table.reassign(name, this.toString(statement.identifier, value));
                break;
            case Token.BOOLEAN_TYPE:
                this.symbol_table.reassign(name, this.toBoolean(value));
                break;
        }

        return null;
    }

    public interpretIfStatement(statement: Statement.If): void {
        var condition: boolean = this.toBoolean(this.symbol_table.get(this.line, "IT"));

        if(condition)
            for(var stmnt of statement.then_block)
                this.execute(stmnt);
        else
            for(var stmnt of statement.else_block)
                this.execute(stmnt);

        return null;
    }

    public interpretSwitchStatement(statement: Statement.Switch): void {
        var value: any = this.symbol_table.get(this.line, "IT");
        var code_block: Array<Statement> = statement.cases.get(value);

        if(code_block == null && !statement.cases.has(value) && statement.default_case != null) {
            code_block = statement.default_case;
        }

        for(var stmnt of code_block)
            this.execute(stmnt);

        return null;
    }

    public interpretLoopStatement(statement: Statement.Loop): void {
        var loop_type: Statement.Loop.LoopType = statement.type;
        var counter: Token = statement.counter;
        var operation: string = statement.operation.getLexeme();
        var counter_name: string = counter.getLexeme();

        if(!this.symbol_table.containsKey(counter_name)) throw new RuntimeError(this.line, "Undeclared variable '" + counter_name + "'");

        switch(loop_type) {
            case Statement.Loop.LoopType.TIL:
                while(!(this.toBoolean(this.evaluate(statement.expression)))) {
                    for(var stmnt of statement.code_block)
                        this.execute(stmnt);
                    var value: any = this.symbol_table.get(this.line, counter_name);

                    if(operation === "UPPIN") {
                        this.symbol_table.reassign(counter_name, this.toInteger(counter, value + 1));
                    } else if (operation === "NERFIN") {
                        this.symbol_table.reassign(counter_name, this.toInteger(counter, value - 1));
                    }
                }
                break;
            case Statement.Loop.LoopType.WILE:
                while(this.toBoolean(this.evaluate(statement.expression))) {
                    for(var stmnt of statement.code_block)
                        this.execute(stmnt);
                    var value: any = this.symbol_table.get(this.line, counter_name);

                    if(operation === "UPPIN") {
                        this.symbol_table.reassign(counter_name, this.toInteger(counter, value + 1));
                    } else if (operation === "NERFIN") {
                        this.symbol_table.reassign(counter_name, this.toInteger(counter, value - 1));
                    }
                }
                break;
        }

        return null;
    }

    public toBoolean(b: any): boolean {
        return Boolean(b);
    }

    public toInteger(token: Token, source: any): number {
        if(typeof source === "boolean") {
            if(source) return 1;
            return 0;
        } else if(typeof source === "string") {
            if(this.matchesInteger(source)) return parseInt(source);
            else throw new RuntimeError(token.getLine(), "String must be in NUMBR form");
        } else if (source == null) return 0;

        return Math.trunc(source);
    }

    public toDouble(token: Token, source: any): number {
        if(typeof source === "number")
            return source;
        else if (typeof source === "boolean") {
            if(source) return 1;
            else return 0;
        } else if (typeof source === "string") {
            if (this.matchesDouble(source)) return parseFloat(source);
            else throw new RuntimeError(token.getLine(), "String must be in NUMBAR form");
        } else if (source == null) return 0;

        return source;
    }

    public toString(token: Token, source: any): string {
        if(typeof source === "number") {
            // Check first if number is a decimal
            if (source % 1 != 0) 
                return source.toFixed(2).toString();
            return source.toString();
        } else if (typeof source === "boolean") {
            throw new RuntimeError(token.getLine(), "Cannot cast TROOF into YARN");
        } else if(source == null){
            return "";
        }
        return source;
    }

    private matchesInteger(s: string): boolean {
        return /((-?[1-9][0-9]*)|0)/.test(s);
    }

    private matchesDouble(s: string): boolean {
        return /((-?(([1-9][0-9]*)|0)\.[0-9]+)|0\.0)/.test(s);
    }

    public getSymbolTable(): SymbolTable {
        return this.symbol_table;
    }
}