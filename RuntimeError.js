export class RuntimeError extends Error {
    constructor(line, message) {
        super(message);
        this.line = line;
    }
    getLine() { return this.line; }
    getMessage() { return this.message; }
}
