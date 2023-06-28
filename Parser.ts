import { Token } from './Token.js';
import { Statement } from './Statement.js';
import { Expr } from './Expr.js';
import { Main } from './Main.js';

export class Parser {
    private tokens: Array<Token>;
    private current: number = 0;

    public static ARITHMETIC_TYPES: string[] = [
        Token.ADDITION_OPERATOR, Token.SUBTRACTION_OPERATOR,
        Token.MULTIPLICATION_OPERATOR, Token.DIVISION_OPERATOR,
        Token.MODULO_OPERATOR, Token.MAX_OPERATOR,
        Token.MIN_OPERATOR
    ];

    public static LOGICAL_BINARY_TYPES: string[] = [
        Token.AND_OPERATOR, Token.OR_OPERATOR, Token.XOR_OPERATOR
    ];

    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
    }

    public parse(): Array<Statement> {
        try {
            if(this.match(Token.CODE_DELIMITER_START)) {
                if(this.match(Token.STATEMENT_DELIMITER))
                    return this.program().body;
                else throw this.error(this.lookahead(), "Expected statement delimiter");
            } else throw this.error(this.lookahead(), "Expected HAI");
        } catch(e) {
            return null;
        }
    }

    private program(): Statement.Program {
        let body: Array<Statement> = new Array<Statement>();
        while(!this.isAtEnd()) {
            body.push(this.global_construct());
            if (!this.match(Token.STATEMENT_DELIMITER)) {
                throw this.error(this.lookahead(), "Expected statement delimiter");
            }
        }

        if(this.consumeEndToken()) {
            return new Statement.Program(body);
        } else {
            throw this.error(this.recent(), "Expected KTHXBYE");
        }
    }

    private global_construct(): Statement {
        if(this.match(Token.VARIABLE_DECLARATION)) return this.vardeclare();

        return this.statement();
    }

    private statement(): Statement {
        if(this.match(Token.OUTPUT_KEYWORD)) return this.print();
        if(this.match(Token.INPUT_KEYWORD)) return this.input();
        if(this.match(Token.VARIABLE_IDENTIFIER))
            if(this.match(Token.VARIABLE_REASSIGNMENT))
                return this.varassign();
            else this.current--;
        if(this.match(Token.VARIABLE_IDENTIFIER))
            if(this.match(Token.TYPECAST_TYPE_REASSIGNMENT))
                return this.typecast_reassign();
            else this.current--;
        if(this.match(Token.IF_DELIMITER_START)) return this.conditional_if();
        if(this.match(Token.SWITCH_DELIMITER_START)) return this.conditional_switch();
        if(this.match(Token.LOOP_DELIMITER_START)) return this.loop();

        // If none of the statements above, then it must be an expression statement
        return new Statement.Expression(this.unnestable_expression());
    }

    private print(): Statement {
        // Keep looping until current statement is the statement delimiter
        let expressions: Array<Expr> = new Array<Expr>();
        let first_expression: Expr = this.nestable_expression();
        
        expressions.push(first_expression);

        // Keep adding operands until statement delimiter is encountered
        while(!this.check(Token.STATEMENT_DELIMITER)) {
            var expression: Expr = this.nestable_expression();
            expressions.push(expression);
        }

        return new Statement.Print(expressions);
    }

    private input(): Statement {
        if(this.match(Token.VARIABLE_IDENTIFIER)) {
            var identifier: Token = this.recent();

            return new Statement.Input(identifier);
        } else throw this.error(this.recent(), "Expected variable identifier");
    }

    private vardeclare(): Statement {
        if(this.match(Token.VARIABLE_IDENTIFIER)) {
            var identifier: Token = this.recent();

            var value: Expr = null;
            if(this.match(Token.VARIABLE_ASSIGNMENT)) {
                value = this.unnestable_expression();
            }

            return new Statement.Variable(identifier, value);
        } else throw this.error(this.recent(), "Expected variable identifier");
    }

    private varassign(): Statement {
        // Current token is the expression, so rollback 2 tokens to get the identifier
        var identifier: Token = this.tokens[this.current - 2];
        var value: Expr = this.nestable_expression();

        return new Statement.Reassign(identifier, value);
    }

    private conditional_if(): Statement {
        var then_block: Array<Statement> = new Array<Statement>();
        var else_block: Array<Statement> = new Array<Statement>();
        if(this.match(Token.STATEMENT_DELIMITER)) {
            if(this.match(Token.IF_CONSTRUCT)) {
                if(this.match(Token.STATEMENT_DELIMITER)) {
                    // While the NO WAI keyword is not yet encountered, keep adding statements
                    while(!this.match(Token.ELSE_CONSTRUCT)) {
                        var statement: Statement = this.statement();
                        then_block.push(statement);
                        if(!this.match(Token.STATEMENT_DELIMITER)) {
                            throw this.error(this.recent(), "Expected statement delimiter");
                        }
                    }

                    // At this point, the NO WAI token is consumed
                    if(this.match(Token.STATEMENT_DELIMITER)) {
                        // Keep adding statements until OIC token is encountered
                        while(!this.match(Token.CONDITIONAL_DELIMITER_END)) {
                            var statement: Statement = this.statement();
                            else_block.push(statement);
                            if(!this.match(Token.STATEMENT_DELIMITER)) {
                                throw this.error(this.recent(), "Expected statement delimiter");
                            }
                        }

                        return new Statement.If(then_block, else_block);
                    } else throw this.error(this.recent(), "Expected statement delimiter");
                } else throw this.error(this.recent(), "Expected statement delimiter");
            } else throw this.error(this.recent(), "Expected YA RLY");
        } else throw this.error(this.recent(), "Expected statement delimiter");
    }

    private conditional_switch(): Statement {
        var cases: Map<any, Array<Statement>> = new Map<any, Array<Statement>>();
        var default_case: Array<Statement> = new Array<Statement>();
        if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");

        var literals: Array<Token> = new Array<Token>();

        while(!(this.check(Token.CONDITIONAL_DELIMITER_END) || this.check(Token.SWITCH_DEFAULT_CONSTRUCT))) {
            if(!this.match(Token.SWITCH_CASE_CONSTRUCT)) throw this.error(this.recent(), "Expected OMG");
            if(!this.match(Token.LITERAL)) throw this.error(this.recent(), "Expected literal");

            var literal: Token = this.recent();
            literals.push(literal);

            if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");

            // Keep adding statements until GTFO/OMG/OMGWTF/OIC is encountered
            while(!(this.check(Token.BREAK_KEYWORD) || this.check(Token.SWITCH_CASE_CONSTRUCT) || this.check(Token.SWITCH_DEFAULT_CONSTRUCT) || this.check(Token.CONDITIONAL_DELIMITER_END))) {
                var statement: Statement = this.statement();
                for(var l of literals) {
                    var key: any = l.getValue();
                    if(cases.get(key) == null) cases.set(key, new Array<Statement>());

                    cases.get(key).push(statement);
                }
                if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");
            }

            // If break is encountered, the list of literals is reset
            if(this.match(Token.BREAK_KEYWORD)) {
                literals = new Array<Token>();
                if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");
            }
        }

        if(this.match(Token.SWITCH_DEFAULT_CONSTRUCT)) {
            if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");

            // Keep adding statements until OIC is encountered
            while(!this.check(Token.CONDITIONAL_DELIMITER_END)) {
                var statement: Statement = this.statement();
                default_case.push(statement);

                if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");
            }
        }

        if(!this.match(Token.CONDITIONAL_DELIMITER_END)) throw this.error(this.recent(), "Expected OIC");

        return default_case.length == 0 ? new Statement.Switch(cases) : new Statement.Switch(cases, default_case);
    }

    private loop(): Statement {
        if(!this.match(Token.VARIABLE_IDENTIFIER)) throw this.error(this.recent(), "Expected loop identifier");
        
        var label: Token = this.recent();

        if(!this.match(Token.LOOP_OPERATION)) throw this.error(this.recent(), "Expected loop operation");

        var operation: Token = this.recent();

        if(!this.match(Token.LOOP_COUNTER_DECLARATION)) throw this.error(this.recent(), "Expected loop counter declaration");

        if(!this.match(Token.VARIABLE_IDENTIFIER)) throw this.error(this.recent(), "Expected variable identifier");

        var counter: Token = this.recent();

        if(!this.match(Token.LOOP_TYPE)) throw this.error(this.recent(), "Expected loop type");

        var loop_type: Statement.Loop.LoopType = this.getLoopType(this.recent());

        var expr: Expr = this.unnestable_expression();

        if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");

        var body: Array<Statement> = new Array<Statement>();

        while(!this.check(Token.LOOP_DELIMITER_END) && this.lookByNAhead(1).getLexeme() !== Token.VARIABLE_IDENTIFIER && this.lookByNAhead(1).getLexeme() !== label.getLexeme()) {
            var statement: Statement = this.statement();
            body.push(statement);
            if(!this.match(Token.STATEMENT_DELIMITER)) throw this.error(this.recent(), "Expected statement delimiter");
        }

        if(!this.match(Token.LOOP_DELIMITER_END)) throw this.error(this.recent(), "Expected loop delimiter");
        if(!this.match(Token.VARIABLE_IDENTIFIER)) throw this.error(this.recent(), "Expected loop identifier");

        return new Statement.Loop(body, label, operation, counter, loop_type, expr);
    }

    private typecast_reassign(): Statement {
        // Current token is the type, so rollback 2 tokens to get the identifier
        var identifier: Token = this.tokens[this.current - 2];
        if(this.match(Token.INTEGER_TYPE, Token.DOUBLE_TYPE, Token.BOOLEAN_TYPE, Token.STRING_TYPE)) {
            var type: string = this.recent().getType();
            return new Statement.TypeReassign(identifier, type);
        } else throw this.error(this.recent(), "Expected data type");
    }

    private unnestable_expression(): Expr {
        if(this.match(Token.AND_MANY) || this.match(Token.OR_MANY)) return this.infinite();

        return this.nestable_expression();
    }

    private nestable_expression(): Expr {
        if(this.isArithmetic()) return this.arithmetic_binary();
        else if (this.isLogicalBinary()) return this.logical_binary();
        else if (this.isComparison()) return this.comparison();
        else if (this.isTypecasting()) return this.typecasting();
        else if (this.isImplicitVar()) return this.implicit_var();
        else if (this.isIdentifier()) return this.identifier();
        else if (this.match(Token.NOT_OPERATOR)) return this.unary();
        else if (this.match(Token.LITERAL)) return this.literal();
        else if (this.match(Token.CONCATENATION)) return this.infinite();

        throw this.error(this.recent(), "Expected expression");
    }

    private literal(): Expr {
        return new Expr.Literal(this.recent().getValue());
    }

    private unary(): Expr {
        var operator: Token = this.recent();
        var right: Expr = this.nestable_expression();
        return new Expr.Unary(operator, right);
    }

    private arithmetic_binary(): Expr {
        var operator: Token = this.recent();
        var left: Expr = this.nestable_expression();
        if(this.match(Token.CONJUNCTION_OPERATOR)) {
            var right: Expr = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        } else {
            throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
        }
    }

    private logical_binary(): Expr {
        var operator: Token = this.recent();
        var left: Expr = this.nestable_expression();
        if(this.match(Token.CONJUNCTION_OPERATOR)) {
            var right: Expr = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        } else throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
    }

    private comparison(): Expr {
        var operator: Token = this.recent();
        var left: Expr = this.nestable_expression();
        if(this.match(Token.CONJUNCTION_OPERATOR)) {
            var right: Expr = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        } else throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
    }

    private typecasting(): Expr {
        var operand: Expr = this.nestable_expression();
        if(this.match(Token.TYPECAST_TYPE_ASSIGNMENT)) {
            if(this.match(Token.INTEGER_TYPE, Token.DOUBLE_TYPE, Token.STRING_TYPE, Token.BOOLEAN_TYPE)) {
                var type: Token = this.recent();
                return new Expr.Typecast(operand, type);
            } else throw this.error(this.recent(), "Expected data type");
        } else throw this.error(this.recent(), "Expected 'A' but got '" + this.lookahead().getLexeme() + "' instead");
    }

    private identifier(): Expr {
        return new Expr.Identifier(this.recent());
    }

    private implicit_var(): Expr {
        return new Expr.Identifier(new Token(0, "IT", Token.IMPLICIT_VARIABLE));
    }

    private infinite(): Expr {
        var operator: Token = this.recent();
        var operands: Array<Expr> = new Array<Expr>();

        var first_expression: Expr = this.nestable_expression();
        operands.push(first_expression);

        // Keep adding operands until MKAY is encountered
        while(!this.match(Token.AND_OR_MANY_DELIMITER)) {
            if(this.match(Token.CONJUNCTION_OPERATOR)) {
                var expression: Expr = this.nestable_expression();
                operands.push(expression);
            } else throw this.error(this.recent(), "Expected 'AN'");
        }

        return new Expr.Infinite(operator, operands);
    }

    private isArithmetic(): boolean {
        var current_type: string = this.lookahead().getType();

        for(var type of Parser.ARITHMETIC_TYPES) {
            if(this.match(type)) return true;
        }
        return false;
    }

    private isLogicalBinary(): boolean {
        for(var type of Parser.LOGICAL_BINARY_TYPES)
            if(this.match(type)) return true;
        return false;
    }

    private isComparison(): boolean {
        if(this.match(Token.EQUAL_OPERATOR, Token.NOT_EQUAL_OPERATOR))
            return true;
        return false;
    }

    private isTypecasting(): boolean {
        return this.match(Token.TYPECASTING);
    }

    private isIdentifier(): boolean {
        return this.match(Token.VARIABLE_IDENTIFIER);
    }

    private isImplicitVar(): boolean {
        return this.match(Token.IMPLICIT_VARIABLE);
    }

    private recent(): Token {
        return this.tokens[this.current - 1];
    }

    private match(...types: string[]): boolean {
        for(var type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private check(type: string): boolean {
        if(this.isAtEnd()) return false;
        return this.lookahead().getType() === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.tokens[this.current - 1];
    }

    private lookahead(): Token {
        return this.tokens[this.current];
    }

    private lookByNAhead(n: number): Token {
        return this.tokens[this.current + n];
    }

    private consumeEndToken(): boolean {
        if(this.current != this.tokens.length && this.isAtEnd()) {
            this.current++;
            if(this.lookahead().getType() === Token.STATEMENT_DELIMITER) {
                this.current++;
                return true;
            }
        }
        return false;
    }

    private isAtEnd(): boolean {
        if(this.current == this.tokens.length) return true;
        return this.lookahead().getType() === Token.CODE_DELIMITER_END;
    }

    private getLoopType(token: Token): Statement.Loop.LoopType {
        if(token.getLexeme() === "TIL") return Statement.Loop.LoopType.TIL;
        if(token.getLexeme() === "WILE") return Statement.Loop.LoopType.WILE;

        throw this.error(token, "Unknown loop type");
    }

    private error(token: Token, message: string): Parser.SyntaxError {
        Main.syntaxError(token, message);
        return new SyntaxError();
    }
}

export namespace Parser {
    export class SyntaxError extends Error {
        constructor(message: string) {
            super(message);
        }
    }
}