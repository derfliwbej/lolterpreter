export class RuntimeError extends Error {
    private line: number;

    constructor(line: number, message: string) {
        super(message);
        this.line = line;
    }

    public getLine(): number { return this.line; }

    public getMessage(): string { return this.message; }
}