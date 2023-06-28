import { Lexer } from './Lexer.js';
import { Parser } from './Parser.js';
import { Interpreter } from './Interpreter.js';
import { Statement } from './Statement.js';
import { Token } from './Token.js';
import { SymbolTable } from './SymbolTable.js';
import { RuntimeError } from './RuntimeError.js';

export class Main {
    private static hadError: boolean = null;
    private static fileName: String = null;
    private static consoleElement: HTMLDivElement = null;
    private static lexemeTable: HTMLTableElement = null;
    private static symbolTable: HTMLTableElement = null;

    public static consoleLog(log: string): void {
        let newLog = document.createElement('p');
        newLog.innerHTML = log;

        Main.consoleElement.appendChild(newLog);
    }

    public static getInput(title: string, message: string): string {
        return prompt(title, message);
    }

    public static resetConsole(): void {
        Main.consoleElement.innerHTML = "";
    }

    public static lexicalError(line: number, message: string): void {
        Main.reportError(line, message);
    }

    public static syntaxError(token: Token, message: string): void  {
        Main.reportError(token.getLine(), message);
    }

    public static runtimeError(error: RuntimeError): void {
        Main.reportError(error.getLine(), error.getMessage());
    }

    private static reportError(line: number, message: string): void {
        let errorMessage = document.createElement('p');

        errorMessage.innerHTML = `Line ${line}: Error: ${message}`;

        Main.consoleElement.appendChild(errorMessage);
        Main.hadError = true;
    }

    public static updateLexemeTable(tokens: Array<Token>): void {
        // Reset lexeme table
        Main.lexemeTable.innerHTML = "<tr><th>Lexeme</th><th>Classification</th></tr>";

        tokens.forEach((token: Token) => {
            // Add a new row
            let newRow = document.createElement('tr');
            let lexemeElement = document.createElement('td');
            let classElement = document.createElement('td');

            lexemeElement.innerHTML = token.getLexeme();
            classElement.innerHTML = token.getType();

            newRow.appendChild(lexemeElement);
            newRow.appendChild(classElement);

            Main.lexemeTable.appendChild(newRow);
        });
    }

    public static updateSymbolTable(symbolTable: SymbolTable) {
        // Reset symbol table
        Main.symbolTable.innerHTML = "<tr><th>Identifier</th><th>Value</th></tr>";

        symbolTable.getTable().forEach((value: any, key: string) => {
            // Add a new row
            let newRow = document.createElement('tr');
            let identifier = document.createElement('td');
            let valueElement = document.createElement('td');

            identifier.innerHTML = key;
            valueElement.innerHTML = value;

            newRow.appendChild(identifier);
            newRow.appendChild(valueElement);

            Main.symbolTable.appendChild(newRow);
        });
    }

    public static run(source: string, consoleElement: HTMLDivElement, lexemeTable: HTMLTableElement, symbolTable: HTMLTableElement): void {
        // Reset hadError
        Main.hadError = false;
        Main.consoleElement = consoleElement;
        Main.lexemeTable = lexemeTable;
        Main.symbolTable = symbolTable;
        Main.resetConsole();

        var lexer: Lexer = new Lexer(source);
        lexer.lex();

        if (Main.hadError) return;

        var tokens: Array<Token> = lexer.getTokens();

        Main.updateLexemeTable(tokens);

        var parser: Parser = new Parser(tokens);
        var statements: Array<Statement> = parser.parse();

        if (Main.hadError) return;

        var interpreter: Interpreter = new Interpreter();
        interpreter.interpret(statements);

        Main.updateSymbolTable(interpreter.getSymbolTable());
    }
}

const inputFile = document.getElementById('inputfile') as HTMLInputElement;
const editor = document.getElementById('editor') as HTMLTextAreaElement;
const consoleElement = document.getElementById('console') as HTMLDivElement;
const lexemeTable = document.getElementById('lexeme-table') as HTMLTableElement;
const symbolTable = document.getElementById('symbol-table') as HTMLTableElement;
const executeButton = document.getElementById('executeButton') as HTMLButtonElement;

inputFile.addEventListener('change', () => {
    const fr = new FileReader();

    fr.addEventListener('load', () => {
        // Set the text inside the editor
        editor.value = fr.result as string;
    }, false);

    if(inputFile.files[0]) {
        fr.readAsText(inputFile.files[0]);
    }
});

executeButton.addEventListener('click', () => {
    Main.run(editor.value, consoleElement, lexemeTable, symbolTable);
});