import { Lexer } from './Lexer.js';
import { Parser } from './Parser.js';
import { Interpreter } from './Interpreter.js';
export class Main {
    static consoleLog(log) {
        let newLog = document.createElement('p');
        newLog.innerHTML = log;
        Main.consoleElement.appendChild(newLog);
    }
    static getInput(title, message) {
        return prompt(title, message);
    }
    static resetConsole() {
        Main.consoleElement.innerHTML = "";
    }
    static lexicalError(line, message) {
        Main.reportError(line, message);
    }
    static syntaxError(token, message) {
        Main.reportError(token.getLine(), message);
    }
    static runtimeError(error) {
        Main.reportError(error.getLine(), error.getMessage());
    }
    static reportError(line, message) {
        let errorMessage = document.createElement('p');
        errorMessage.innerHTML = `Line ${line}: Error: ${message}`;
        Main.consoleElement.appendChild(errorMessage);
        Main.hadError = true;
    }
    static updateLexemeTable(tokens) {
        // Reset lexeme table
        Main.lexemeTable.innerHTML = "<tr><th>Lexeme</th><th>Classification</th></tr>";
        tokens.forEach((token) => {
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
    static updateSymbolTable(symbolTable) {
        // Reset symbol table
        Main.symbolTable.innerHTML = "<tr><th>Identifier</th><th>Value</th></tr>";
        symbolTable.getTable().forEach((value, key) => {
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
    static run(source, consoleElement, lexemeTable, symbolTable) {
        // Reset hadError
        Main.hadError = false;
        Main.consoleElement = consoleElement;
        Main.lexemeTable = lexemeTable;
        Main.symbolTable = symbolTable;
        Main.resetConsole();
        var lexer = new Lexer(source);
        lexer.lex();
        if (Main.hadError)
            return;
        var tokens = lexer.getTokens();
        Main.updateLexemeTable(tokens);
        var parser = new Parser(tokens);
        var statements = parser.parse();
        if (Main.hadError)
            return;
        var interpreter = new Interpreter();
        interpreter.interpret(statements);
        Main.updateSymbolTable(interpreter.getSymbolTable());
    }
}
Main.hadError = null;
Main.fileName = null;
Main.consoleElement = null;
Main.lexemeTable = null;
Main.symbolTable = null;
const inputFile = document.getElementById('inputfile');
const editor = document.getElementById('editor');
const consoleElement = document.getElementById('console');
const lexemeTable = document.getElementById('lexeme-table');
const symbolTable = document.getElementById('symbol-table');
const executeButton = document.getElementById('executeButton');
inputFile.addEventListener('change', () => {
    const fr = new FileReader();
    fr.addEventListener('load', () => {
        // Set the text inside the editor
        editor.value = fr.result;
    }, false);
    if (inputFile.files[0]) {
        fr.readAsText(inputFile.files[0]);
    }
});
executeButton.addEventListener('click', () => {
    Main.run(editor.value, consoleElement, lexemeTable, symbolTable);
});
