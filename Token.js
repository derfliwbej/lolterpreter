export class Token {
    constructor(line, lexeme, type, value) {
        this.line = line;
        this.lexeme = lexeme;
        this.type = type;
        this.value = value;
    }
    getLine() { return this.line; }
    getLexeme() { return this.lexeme; }
    getType() { return this.type; }
    getValue() { return this.value; }
}
Token.CODE_DELIMITER_START = "Code Delimiter - Start";
Token.CODE_DELIMITER_END = "Code Delimiter - End";
Token.VARIABLE_DECLARATION = "Variable Declaration";
Token.VARIABLE_IDENTIFIER = "Variable Identifier";
Token.VARIABLE_ASSIGNMENT = "Variable Assignment";
Token.VARIABLE_REASSIGNMENT = "Variable Reassignment";
Token.IMPLICIT_VARIABLE = "Implicit Variable";
Token.LITERAL = "Literal";
Token.OUTPUT_KEYWORD = "Output Keyword";
Token.INPUT_KEYWORD = "Input Keyword";
Token.STRING_DELIMITER = "String Delimiter";
Token.LOOP_DELIMITER_START = "Loop Delimiter Start";
Token.LOOP_DELIMITER_END = "Loop Delimiter End";
Token.LOOP_OPERATION = "Loop Operation";
Token.LOOP_COUNTER_DECLARATION = "Loop Counter Declaration";
Token.LOOP_TYPE = "Loop Type";
Token.BREAK_KEYWORD = "Break Keyword";
Token.TYPECASTING = "Typecasting";
Token.TYPECAST_TYPE_REASSIGNMENT = "Typecast Type Reassignment";
Token.TYPECAST_TYPE_ASSIGNMENT = "Typecast Type Assignment";
Token.CONCATENATION = "Concatenation";
Token.CONJUNCTION_OPERATOR = "Conjunction Operator";
Token.ADDITION_OPERATOR = "Addition Operator";
Token.SUBTRACTION_OPERATOR = "Subtraction Operator";
Token.MULTIPLICATION_OPERATOR = "Multiplication Operator";
Token.DIVISION_OPERATOR = "Division Operator";
Token.MODULO_OPERATOR = "Modulo Operator";
Token.MAX_OPERATOR = "Max Operator";
Token.MIN_OPERATOR = "Min Operator";
Token.AND_OPERATOR = "Logical AND Operator";
Token.OR_OPERATOR = "Logical OR Operator";
Token.XOR_OPERATOR = "Logical XOR Operator";
Token.NOT_OPERATOR = "Logical NOT Operator";
Token.AND_MANY = "Logical AND With Infinite Arity";
Token.OR_MANY = "Logical OR With Infinite Arity";
Token.AND_OR_MANY_DELIMITER = "AND/OR With Infinite Arity Delimiter";
Token.EQUAL_OPERATOR = "Equal Operator";
Token.NOT_EQUAL_OPERATOR = "Not Equal Operator";
Token.IF_DELIMITER_START = "If Delimiter Start";
Token.CONDITIONAL_DELIMITER_END = "End Delimiter for Conditions";
Token.IF_CONSTRUCT = "If Construct";
Token.ELSE_CONSTRUCT = "Else Construct";
Token.SWITCH_DELIMITER_START = "Switch Delimiter Start";
Token.SWITCH_CASE_CONSTRUCT = "Case Construct";
Token.SWITCH_DEFAULT_CONSTRUCT = "Default Construct";
Token.SINGLE_LINE_COMMENT_DECLARATION = "Single Line Comment Declaration";
Token.MULTILINE_COMMENT_DELIMITER = "Multiline Comment Delimiter";
Token.STATEMENT_DELIMITER = "Statement Delimiter";
Token.INTEGER_TYPE = "Integer Type";
Token.DOUBLE_TYPE = "Double Type";
Token.STRING_TYPE = "String Type";
Token.BOOLEAN_TYPE = "Boolean Type";
