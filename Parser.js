import { Token } from './Token.js';
import { Statement } from './Statement.js';
import { Expr } from './Expr.js';
import { Main } from './Main.js';
export class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    parse() {
        try {
            if (this.match(Token.CODE_DELIMITER_START)) {
                if (this.match(Token.STATEMENT_DELIMITER))
                    return this.program().body;
                else
                    throw this.error(this.lookahead(), "Expected statement delimiter");
            }
            else
                throw this.error(this.lookahead(), "Expected HAI");
        }
        catch (e) {
            return null;
        }
    }
    program() {
        let body = new Array();
        while (!this.isAtEnd()) {
            body.push(this.global_construct());
            if (!this.match(Token.STATEMENT_DELIMITER)) {
                throw this.error(this.lookahead(), "Expected statement delimiter");
            }
        }
        if (this.consumeEndToken()) {
            return new Statement.Program(body);
        }
        else {
            throw this.error(this.recent(), "Expected KTHXBYE");
        }
    }
    global_construct() {
        if (this.match(Token.VARIABLE_DECLARATION))
            return this.vardeclare();
        return this.statement();
    }
    statement() {
        if (this.match(Token.OUTPUT_KEYWORD))
            return this.print();
        if (this.match(Token.INPUT_KEYWORD))
            return this.input();
        if (this.match(Token.VARIABLE_IDENTIFIER))
            if (this.match(Token.VARIABLE_REASSIGNMENT))
                return this.varassign();
            else
                this.current--;
        if (this.match(Token.VARIABLE_IDENTIFIER))
            if (this.match(Token.TYPECAST_TYPE_REASSIGNMENT))
                return this.typecast_reassign();
            else
                this.current--;
        if (this.match(Token.IF_DELIMITER_START))
            return this.conditional_if();
        if (this.match(Token.SWITCH_DELIMITER_START))
            return this.conditional_switch();
        if (this.match(Token.LOOP_DELIMITER_START))
            return this.loop();
        // If none of the statements above, then it must be an expression statement
        return new Statement.Expression(this.unnestable_expression());
    }
    print() {
        // Keep looping until current statement is the statement delimiter
        let expressions = new Array();
        let first_expression = this.nestable_expression();
        expressions.push(first_expression);
        // Keep adding operands until statement delimiter is encountered
        while (!this.check(Token.STATEMENT_DELIMITER)) {
            var expression = this.nestable_expression();
            expressions.push(expression);
        }
        return new Statement.Print(expressions);
    }
    input() {
        if (this.match(Token.VARIABLE_IDENTIFIER)) {
            var identifier = this.recent();
            return new Statement.Input(identifier);
        }
        else
            throw this.error(this.recent(), "Expected variable identifier");
    }
    vardeclare() {
        if (this.match(Token.VARIABLE_IDENTIFIER)) {
            var identifier = this.recent();
            var value = null;
            if (this.match(Token.VARIABLE_ASSIGNMENT)) {
                value = this.unnestable_expression();
            }
            return new Statement.Variable(identifier, value);
        }
        else
            throw this.error(this.recent(), "Expected variable identifier");
    }
    varassign() {
        // Current token is the expression, so rollback 2 tokens to get the identifier
        var identifier = this.tokens[this.current - 2];
        var value = this.nestable_expression();
        return new Statement.Reassign(identifier, value);
    }
    conditional_if() {
        var then_block = new Array();
        var else_block = new Array();
        if (this.match(Token.STATEMENT_DELIMITER)) {
            if (this.match(Token.IF_CONSTRUCT)) {
                if (this.match(Token.STATEMENT_DELIMITER)) {
                    // While the NO WAI keyword is not yet encountered, keep adding statements
                    while (!this.match(Token.ELSE_CONSTRUCT)) {
                        var statement = this.statement();
                        then_block.push(statement);
                        if (!this.match(Token.STATEMENT_DELIMITER)) {
                            throw this.error(this.recent(), "Expected statement delimiter");
                        }
                    }
                    // At this point, the NO WAI token is consumed
                    if (this.match(Token.STATEMENT_DELIMITER)) {
                        // Keep adding statements until OIC token is encountered
                        while (!this.match(Token.CONDITIONAL_DELIMITER_END)) {
                            var statement = this.statement();
                            else_block.push(statement);
                            if (!this.match(Token.STATEMENT_DELIMITER)) {
                                throw this.error(this.recent(), "Expected statement delimiter");
                            }
                        }
                        return new Statement.If(then_block, else_block);
                    }
                    else
                        throw this.error(this.recent(), "Expected statement delimiter");
                }
                else
                    throw this.error(this.recent(), "Expected statement delimiter");
            }
            else
                throw this.error(this.recent(), "Expected YA RLY");
        }
        else
            throw this.error(this.recent(), "Expected statement delimiter");
    }
    conditional_switch() {
        var cases = new Map();
        var default_case = new Array();
        if (!this.match(Token.STATEMENT_DELIMITER))
            throw this.error(this.recent(), "Expected statement delimiter");
        var literals = new Array();
        while (!(this.check(Token.CONDITIONAL_DELIMITER_END) || this.check(Token.SWITCH_DEFAULT_CONSTRUCT))) {
            if (!this.match(Token.SWITCH_CASE_CONSTRUCT))
                throw this.error(this.recent(), "Expected OMG");
            if (!this.match(Token.LITERAL))
                throw this.error(this.recent(), "Expected literal");
            var literal = this.recent();
            literals.push(literal);
            if (!this.match(Token.STATEMENT_DELIMITER))
                throw this.error(this.recent(), "Expected statement delimiter");
            // Keep adding statements until GTFO/OMG/OMGWTF/OIC is encountered
            while (!(this.check(Token.BREAK_KEYWORD) || this.check(Token.SWITCH_CASE_CONSTRUCT) || this.check(Token.SWITCH_DEFAULT_CONSTRUCT) || this.check(Token.CONDITIONAL_DELIMITER_END))) {
                var statement = this.statement();
                for (var l of literals) {
                    var key = l.getValue();
                    if (cases.get(key) == null)
                        cases.set(key, new Array());
                    cases.get(key).push(statement);
                }
                if (!this.match(Token.STATEMENT_DELIMITER))
                    throw this.error(this.recent(), "Expected statement delimiter");
            }
            // If break is encountered, the list of literals is reset
            if (this.match(Token.BREAK_KEYWORD)) {
                literals = new Array();
                if (!this.match(Token.STATEMENT_DELIMITER))
                    throw this.error(this.recent(), "Expected statement delimiter");
            }
        }
        if (this.match(Token.SWITCH_DEFAULT_CONSTRUCT)) {
            if (!this.match(Token.STATEMENT_DELIMITER))
                throw this.error(this.recent(), "Expected statement delimiter");
            // Keep adding statements until OIC is encountered
            while (!this.check(Token.CONDITIONAL_DELIMITER_END)) {
                var statement = this.statement();
                default_case.push(statement);
                if (!this.match(Token.STATEMENT_DELIMITER))
                    throw this.error(this.recent(), "Expected statement delimiter");
            }
        }
        if (!this.match(Token.CONDITIONAL_DELIMITER_END))
            throw this.error(this.recent(), "Expected OIC");
        return default_case.length == 0 ? new Statement.Switch(cases) : new Statement.Switch(cases, default_case);
    }
    loop() {
        if (!this.match(Token.VARIABLE_IDENTIFIER))
            throw this.error(this.recent(), "Expected loop identifier");
        var label = this.recent();
        if (!this.match(Token.LOOP_OPERATION))
            throw this.error(this.recent(), "Expected loop operation");
        var operation = this.recent();
        if (!this.match(Token.LOOP_COUNTER_DECLARATION))
            throw this.error(this.recent(), "Expected loop counter declaration");
        if (!this.match(Token.VARIABLE_IDENTIFIER))
            throw this.error(this.recent(), "Expected variable identifier");
        var counter = this.recent();
        if (!this.match(Token.LOOP_TYPE))
            throw this.error(this.recent(), "Expected loop type");
        var loop_type = this.getLoopType(this.recent());
        var expr = this.unnestable_expression();
        if (!this.match(Token.STATEMENT_DELIMITER))
            throw this.error(this.recent(), "Expected statement delimiter");
        var body = new Array();
        while (!this.check(Token.LOOP_DELIMITER_END) && this.lookByNAhead(1).getLexeme() !== Token.VARIABLE_IDENTIFIER && this.lookByNAhead(1).getLexeme() !== label.getLexeme()) {
            var statement = this.statement();
            body.push(statement);
            if (!this.match(Token.STATEMENT_DELIMITER))
                throw this.error(this.recent(), "Expected statement delimiter");
        }
        if (!this.match(Token.LOOP_DELIMITER_END))
            throw this.error(this.recent(), "Expected loop delimiter");
        if (!this.match(Token.VARIABLE_IDENTIFIER))
            throw this.error(this.recent(), "Expected loop identifier");
        return new Statement.Loop(body, label, operation, counter, loop_type, expr);
    }
    typecast_reassign() {
        // Current token is the type, so rollback 2 tokens to get the identifier
        var identifier = this.tokens[this.current - 2];
        if (this.match(Token.INTEGER_TYPE, Token.DOUBLE_TYPE, Token.BOOLEAN_TYPE, Token.STRING_TYPE)) {
            var type = this.recent().getType();
            return new Statement.TypeReassign(identifier, type);
        }
        else
            throw this.error(this.recent(), "Expected data type");
    }
    unnestable_expression() {
        if (this.match(Token.AND_MANY) || this.match(Token.OR_MANY))
            return this.infinite();
        return this.nestable_expression();
    }
    nestable_expression() {
        if (this.isArithmetic())
            return this.arithmetic_binary();
        else if (this.isLogicalBinary())
            return this.logical_binary();
        else if (this.isComparison())
            return this.comparison();
        else if (this.isTypecasting())
            return this.typecasting();
        else if (this.isImplicitVar())
            return this.implicit_var();
        else if (this.isIdentifier())
            return this.identifier();
        else if (this.match(Token.NOT_OPERATOR))
            return this.unary();
        else if (this.match(Token.LITERAL))
            return this.literal();
        else if (this.match(Token.CONCATENATION))
            return this.infinite();
        throw this.error(this.recent(), "Expected expression");
    }
    literal() {
        return new Expr.Literal(this.recent().getValue());
    }
    unary() {
        var operator = this.recent();
        var right = this.nestable_expression();
        return new Expr.Unary(operator, right);
    }
    arithmetic_binary() {
        var operator = this.recent();
        var left = this.nestable_expression();
        if (this.match(Token.CONJUNCTION_OPERATOR)) {
            var right = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        }
        else {
            throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
        }
    }
    logical_binary() {
        var operator = this.recent();
        var left = this.nestable_expression();
        if (this.match(Token.CONJUNCTION_OPERATOR)) {
            var right = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        }
        else
            throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
    }
    comparison() {
        var operator = this.recent();
        var left = this.nestable_expression();
        if (this.match(Token.CONJUNCTION_OPERATOR)) {
            var right = this.nestable_expression();
            return new Expr.Binary(left, operator, right);
        }
        else
            throw this.error(this.lookahead(), "Expected 'AN' but got " + this.lookahead().getLexeme() + " instead");
    }
    typecasting() {
        var operand = this.nestable_expression();
        if (this.match(Token.TYPECAST_TYPE_ASSIGNMENT)) {
            if (this.match(Token.INTEGER_TYPE, Token.DOUBLE_TYPE, Token.STRING_TYPE, Token.BOOLEAN_TYPE)) {
                var type = this.recent();
                return new Expr.Typecast(operand, type);
            }
            else
                throw this.error(this.recent(), "Expected data type");
        }
        else
            throw this.error(this.recent(), "Expected 'A' but got '" + this.lookahead().getLexeme() + "' instead");
    }
    identifier() {
        return new Expr.Identifier(this.recent());
    }
    implicit_var() {
        return new Expr.Identifier(new Token(0, "IT", Token.IMPLICIT_VARIABLE));
    }
    infinite() {
        var operator = this.recent();
        var operands = new Array();
        var first_expression = this.nestable_expression();
        operands.push(first_expression);
        // Keep adding operands until MKAY is encountered
        while (!this.match(Token.AND_OR_MANY_DELIMITER)) {
            if (this.match(Token.CONJUNCTION_OPERATOR)) {
                var expression = this.nestable_expression();
                operands.push(expression);
            }
            else
                throw this.error(this.recent(), "Expected 'AN'");
        }
        return new Expr.Infinite(operator, operands);
    }
    isArithmetic() {
        var current_type = this.lookahead().getType();
        for (var type of Parser.ARITHMETIC_TYPES) {
            if (this.match(type))
                return true;
        }
        return false;
    }
    isLogicalBinary() {
        for (var type of Parser.LOGICAL_BINARY_TYPES)
            if (this.match(type))
                return true;
        return false;
    }
    isComparison() {
        if (this.match(Token.EQUAL_OPERATOR, Token.NOT_EQUAL_OPERATOR))
            return true;
        return false;
    }
    isTypecasting() {
        return this.match(Token.TYPECASTING);
    }
    isIdentifier() {
        return this.match(Token.VARIABLE_IDENTIFIER);
    }
    isImplicitVar() {
        return this.match(Token.IMPLICIT_VARIABLE);
    }
    recent() {
        return this.tokens[this.current - 1];
    }
    match(...types) {
        for (var type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.lookahead().getType() === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.tokens[this.current - 1];
    }
    lookahead() {
        return this.tokens[this.current];
    }
    lookByNAhead(n) {
        return this.tokens[this.current + n];
    }
    consumeEndToken() {
        if (this.current != this.tokens.length && this.isAtEnd()) {
            this.current++;
            if (this.lookahead().getType() === Token.STATEMENT_DELIMITER) {
                this.current++;
                return true;
            }
        }
        return false;
    }
    isAtEnd() {
        if (this.current == this.tokens.length)
            return true;
        return this.lookahead().getType() === Token.CODE_DELIMITER_END;
    }
    getLoopType(token) {
        if (token.getLexeme() === "TIL")
            return Statement.Loop.LoopType.TIL;
        if (token.getLexeme() === "WILE")
            return Statement.Loop.LoopType.WILE;
        throw this.error(token, "Unknown loop type");
    }
    error(token, message) {
        Main.syntaxError(token, message);
        return new SyntaxError();
    }
}
Parser.ARITHMETIC_TYPES = [
    Token.ADDITION_OPERATOR, Token.SUBTRACTION_OPERATOR,
    Token.MULTIPLICATION_OPERATOR, Token.DIVISION_OPERATOR,
    Token.MODULO_OPERATOR, Token.MAX_OPERATOR,
    Token.MIN_OPERATOR
];
Parser.LOGICAL_BINARY_TYPES = [
    Token.AND_OPERATOR, Token.OR_OPERATOR, Token.XOR_OPERATOR
];
(function (Parser) {
    class SyntaxError extends Error {
        constructor(message) {
            super(message);
        }
    }
    Parser.SyntaxError = SyntaxError;
})(Parser || (Parser = {}));
