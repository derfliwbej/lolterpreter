export class Token {
    private line: number;
    private type: string;
    private lexeme: string;
    private value?: any;

    public static CODE_DELIMITER_START: string = "Code Delimiter - Start";
    public static CODE_DELIMITER_END: string  = "Code Delimiter - End";
    public static VARIABLE_DECLARATION: string = "Variable Declaration";
    public static VARIABLE_IDENTIFIER: string = "Variable Identifier";
    public static VARIABLE_ASSIGNMENT: string = "Variable Assignment";
    public static VARIABLE_REASSIGNMENT: string = "Variable Reassignment";
    public static IMPLICIT_VARIABLE: string = "Implicit Variable";
    public static LITERAL: string = "Literal";
    public static OUTPUT_KEYWORD: string = "Output Keyword";
    public static INPUT_KEYWORD: string = "Input Keyword";
    public static STRING_DELIMITER: string = "String Delimiter";
    public static LOOP_DELIMITER_START: string = "Loop Delimiter Start";
    public static LOOP_DELIMITER_END: string = "Loop Delimiter End";
    public static LOOP_OPERATION: string = "Loop Operation";
    public static LOOP_COUNTER_DECLARATION: string = "Loop Counter Declaration";
    public static LOOP_TYPE: string = "Loop Type";
    public static BREAK_KEYWORD: string = "Break Keyword";
    public static TYPECASTING: string = "Typecasting";
    public static TYPECAST_TYPE_REASSIGNMENT: string = "Typecast Type Reassignment";
    public static TYPECAST_TYPE_ASSIGNMENT: string = "Typecast Type Assignment";
    public static CONCATENATION: string = "Concatenation";
    public static CONJUNCTION_OPERATOR: string = "Conjunction Operator";
    public static ADDITION_OPERATOR: string = "Addition Operator";
    public static SUBTRACTION_OPERATOR: string = "Subtraction Operator";
    public static MULTIPLICATION_OPERATOR: string = "Multiplication Operator";
    public static DIVISION_OPERATOR: string = "Division Operator";
    public static MODULO_OPERATOR: string = "Modulo Operator";
    public static MAX_OPERATOR: string = "Max Operator";
    public static MIN_OPERATOR: string = "Min Operator";
    public static AND_OPERATOR: string = "Logical AND Operator";
    public static OR_OPERATOR: string = "Logical OR Operator";
    public static XOR_OPERATOR: string = "Logical XOR Operator";
    public static NOT_OPERATOR: string = "Logical NOT Operator";
    public static AND_MANY: string = "Logical AND With Infinite Arity";
    public static OR_MANY: string = "Logical OR With Infinite Arity";
    public static AND_OR_MANY_DELIMITER: string = "AND/OR With Infinite Arity Delimiter";
    public static EQUAL_OPERATOR: string = "Equal Operator";
    public static NOT_EQUAL_OPERATOR: string = "Not Equal Operator";
    public static IF_DELIMITER_START: string = "If Delimiter Start";
    public static CONDITIONAL_DELIMITER_END: string = "End Delimiter for Conditions";
    public static IF_CONSTRUCT: string = "If Construct";
    public static ELSE_CONSTRUCT: string = "Else Construct";
    public static SWITCH_DELIMITER_START: string = "Switch Delimiter Start";
    public static SWITCH_CASE_CONSTRUCT: string = "Case Construct";
    public static SWITCH_DEFAULT_CONSTRUCT: string = "Default Construct";
    public static SINGLE_LINE_COMMENT_DECLARATION: string = "Single Line Comment Declaration";
    public static MULTILINE_COMMENT_DELIMITER: string = "Multiline Comment Delimiter";
    public static STATEMENT_DELIMITER: string = "Statement Delimiter";
    public static INTEGER_TYPE: string = "Integer Type";
    public static DOUBLE_TYPE: string = "Double Type";
    public static STRING_TYPE: string = "String Type";
    public static BOOLEAN_TYPE: string = "Boolean Type";

    constructor(line: number, lexeme: string, type: string, value?: any) {
        this.line = line;
        this.lexeme = lexeme;
        this.type = type;
        this.value = value;
    }

    public getLine(): number { return this.line; }

    public getLexeme(): string { return this.lexeme; }

    public getType(): string { return this.type; }

    public getValue(): any { return this.value; }
}