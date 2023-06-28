import { Token } from './Token.js';
import { Main } from './Main.js';
export class Lexer {
    constructor(source) {
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.errorFlag = false;
        this.tokens = new Array();
        this.source = source;
        Lexer.keywords = new Map();
        Lexer.keywords.set("HAI", Token.CODE_DELIMITER_START);
        Lexer.keywords.set("KTHXBYE", Token.CODE_DELIMITER_END);
        Lexer.keywords.set("GTFO", Token.BREAK_KEYWORD);
        Lexer.keywords.set("AN", Token.CONJUNCTION_OPERATOR);
        Lexer.keywords.set("VISIBLE", Token.OUTPUT_KEYWORD);
        Lexer.keywords.set("BTW", Token.SINGLE_LINE_COMMENT_DECLARATION);
        Lexer.keywords.set("OBTW", Token.MULTILINE_COMMENT_DELIMITER);
        Lexer.keywords.set("TLDR", Token.MULTILINE_COMMENT_DELIMITER);
        Lexer.keywords.set("I HAS A", Token.VARIABLE_DECLARATION);
        Lexer.keywords.set("ITZ", Token.VARIABLE_ASSIGNMENT);
        Lexer.keywords.set("R", Token.VARIABLE_REASSIGNMENT);
        Lexer.keywords.set("IT", Token.IMPLICIT_VARIABLE);
        Lexer.keywords.set("NOT", Token.NOT_OPERATOR);
        Lexer.keywords.set("DIFFRINT", Token.NOT_EQUAL_OPERATOR);
        Lexer.keywords.set("SMOOSH", Token.CONCATENATION);
        Lexer.keywords.set("MAEK", Token.TYPECASTING);
        Lexer.keywords.set("IS NOW A", Token.TYPECAST_TYPE_REASSIGNMENT);
        Lexer.keywords.set("A", Token.TYPECAST_TYPE_ASSIGNMENT);
        Lexer.keywords.set("GIMMEH", Token.INPUT_KEYWORD);
        Lexer.keywords.set("YA RLY", Token.IF_CONSTRUCT);
        Lexer.keywords.set("NO WAI", Token.ELSE_CONSTRUCT);
        Lexer.keywords.set("O RLY?", Token.IF_DELIMITER_START);
        Lexer.keywords.set("OIC", Token.CONDITIONAL_DELIMITER_END);
        Lexer.keywords.set("WTF?", Token.SWITCH_DELIMITER_START);
        Lexer.keywords.set("OMG", Token.SWITCH_CASE_CONSTRUCT);
        Lexer.keywords.set("OMGWTF", Token.SWITCH_DEFAULT_CONSTRUCT);
        Lexer.keywords.set("UPPIN", Token.LOOP_OPERATION);
        Lexer.keywords.set("NERFIN", Token.LOOP_OPERATION);
        Lexer.keywords.set("YR", Token.LOOP_COUNTER_DECLARATION);
        Lexer.keywords.set("TIL", Token.LOOP_TYPE);
        Lexer.keywords.set("WILE", Token.LOOP_TYPE);
        Lexer.keywords.set("SUM OF", Token.ADDITION_OPERATOR);
        Lexer.keywords.set("DIFF OF", Token.SUBTRACTION_OPERATOR);
        Lexer.keywords.set("PRODUKT OF", Token.MULTIPLICATION_OPERATOR);
        Lexer.keywords.set("QUOSHUNT OF", Token.DIVISION_OPERATOR);
        Lexer.keywords.set("MOD OF", Token.MODULO_OPERATOR);
        Lexer.keywords.set("BIGGR OF", Token.MAX_OPERATOR);
        Lexer.keywords.set("SMALLR OF", Token.MIN_OPERATOR);
        Lexer.keywords.set("BOTH OF", Token.AND_OPERATOR);
        Lexer.keywords.set("BOTH SAEM", Token.EQUAL_OPERATOR);
        Lexer.keywords.set("EITHER OF", Token.OR_OPERATOR);
        Lexer.keywords.set("WON OF", Token.XOR_OPERATOR);
        Lexer.keywords.set("ANY OF", Token.OR_MANY);
        Lexer.keywords.set("ALL OF", Token.AND_MANY);
        Lexer.keywords.set("MKAY", Token.AND_OR_MANY_DELIMITER);
        Lexer.keywords.set("IM IN YR", Token.LOOP_DELIMITER_START);
        Lexer.keywords.set("IM OUTTA YR", Token.LOOP_DELIMITER_END);
        Lexer.keywords.set("NUMBR", Token.INTEGER_TYPE);
        Lexer.keywords.set("NUMBAR", Token.DOUBLE_TYPE);
        Lexer.keywords.set("YARN", Token.STRING_TYPE);
        Lexer.keywords.set("TROOF", Token.BOOLEAN_TYPE);
    }
    lex() {
        while (!this.isAtEnd()) {
            if (this.errorFlag)
                return;
            this.start = this.current;
            this.scan();
        }
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    scan() {
        var lexeme;
        var type;
        var value = null;
        // Keep looping until first keyword is found
        while (this.isTokenDelimiter(this.current)) {
            this.start++;
            this.current++;
        }
        var firstChar = this.advance();
        // If string, keep looping until string delimiter is found
        if (firstChar == '\"') {
            this.string();
            if (this.errorFlag)
                return;
            lexeme = this.source.substring(this.start + 1, this.current - 1);
            if (!this.isTokenDelimiter(this.current)) {
                Main.lexicalError(this.line, "Expected token delimiter after string literal");
                this.errorFlag = true;
                return;
            }
            type = Token.LITERAL;
            value = lexeme;
            this.tokens.push(new Token(this.line, lexeme, type, value));
        }
        else {
            // Keep looping until space is found
            this.advanceToNextWord();
            lexeme = this.source.substring(this.start, this.current);
            // Check if current lexeme is a part of two word or three word keyword
            if (this.isPartOfTwo(lexeme)) {
                // Current character is whitespace, so advance
                this.advance();
                // Keep advancing until space/end is found
                this.advanceToNextWord();
                lexeme = this.source.substring(this.start, this.current);
            }
            else if (this.isPartOfThree(lexeme)) {
                // Current character is whitespace, so advance
                this.advance();
                // Keep advancing until space/end is found
                this.advanceToNextWord();
                // Second whitespace
                this.advance();
                this.advanceToNextWord();
                lexeme = this.source.substring(this.start, this.current);
            }
            type = Lexer.keywords.get(lexeme);
            if (type == null) {
                // If not a keyword, check if it is a literal or an identifier
                if (this.isLiteral(lexeme)) {
                    type = Token.LITERAL;
                    if (this.match("WIN", lexeme))
                        value = true;
                    else if (this.match("FAIL", lexeme))
                        value = false;
                    else if (this.match("((-?[1-9][0-9]*)|0)", lexeme))
                        value = parseInt(lexeme);
                    else
                        value = parseFloat(lexeme);
                }
                else if (this.isIdentifier(lexeme))
                    type = Token.VARIABLE_IDENTIFIER;
                else {
                    Main.lexicalError(this.line, "invalid token '" + lexeme + "'");
                    this.errorFlag = true;
                    return;
                }
            }
            if (type === Lexer.keywords.get("BTW")) {
                // Keep consuming characters until the end of the line
                this.lineAdvance();
            }
            else
                this.tokens.push(new Token(this.line, lexeme, type, value));
        }
        // For the whitespace
        this.advance();
    }
    match(pattern, s) {
        return s.match(`^${pattern}$`);
    }
    string() {
        while (this.lookahead() != '\"' && !this.isAtEnd()) {
            if (this.lookahead() == '\n')
                this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            Main.lexicalError(this.line, "Unterminated string");
            this.errorFlag = true;
            return;
        }
        this.advance();
    }
    lookahead() {
        if (this.isAtEnd())
            return '\0';
        return this.source.charAt(this.current);
    }
    advance() {
        if (this.isAtEnd()) {
            this.tokens.push(new Token(this.line, "Statement Delimiter", Token.STATEMENT_DELIMITER));
            return '\0';
        }
        if (this.source.charAt(this.current) == '\n') {
            this.tokens.push(new Token(this.line, "Statement Delimiter", Token.STATEMENT_DELIMITER));
            this.line++;
        }
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    lineAdvance() {
        while (this.source.charAt(this.current - 1) !== "\n") {
            this.current++;
        }
        this.line++;
    }
    advanceToNextWord() {
        while (!this.isAtEnd() && !this.isTokenDelimiter(this.current)) {
            this.advance();
        }
    }
    isTokenDelimiter(char_pos) {
        if (char_pos >= this.source.length)
            return true;
        return this.source.charAt(char_pos).trim() === "";
    }
    isPartOfTwo(lexeme) {
        if (this.match("SUM", lexeme) || this.match("DIFF", lexeme) ||
            this.match("QUOSHUNT", lexeme) || this.match("PRODUKT", lexeme) ||
            this.match("MOD", lexeme) || this.match("BIGGR", lexeme) ||
            this.match("SMALLR", lexeme) || this.match("BOTH", lexeme) ||
            this.match("EITHER", lexeme) || this.match("WON", lexeme) ||
            this.match("ANY", lexeme) || this.match("ALL", lexeme) ||
            this.match("O", lexeme) || this.match("YA", lexeme) ||
            this.match("NO", lexeme)) {
            return true;
        }
        return false;
    }
    isPartOfThree(lexeme) {
        if (this.match("IM", lexeme) || this.match("I", lexeme) || this.match("IS", lexeme)) {
            return true;
        }
        return false;
    }
    isLiteral(lexeme) {
        if (this.match("(\\s|^)((-?[1-9][0-9]*)|0)(\\s|$)", lexeme) ||
            this.match("(\\s|^)((-?(([1-9][0-9]*)|0)\\.[0-9]+)|0\\.0)(\\s|$)", lexeme) ||
            this.match("(\\s|^)(WIN|FAIL)(\\s|$)", lexeme) ||
            this.match("(\\s|^)(NUMBR|NUMBAR|YARN|TROOF|NOOB)(\\s|$)", lexeme)) {
            return true;
        }
        return false;
    }
    isIdentifier(lexeme) {
        if (this.match("(^|\\s)([a-zA-Z][a-zA-Z0-9_]*)($|\\s)", lexeme))
            return true;
        return false;
    }
    getTokens() {
        return this.tokens;
    }
    printTokens() {
        for (var token of this.tokens) {
            console.log(token.getLine() + ": " + token.getLexeme() + " -- " + token.getType() + " -- " + token.getValue());
        }
    }
}
