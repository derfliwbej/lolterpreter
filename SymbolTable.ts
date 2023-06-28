import { RuntimeError } from './RuntimeError.js';

export class SymbolTable {
    private table: Map<string, any> = new Map<string, any>();

    constructor() {
        this.assign(0, "IT", null);
    }

    public assign(line: number, name: string, value: any): void {
        if(this.containsKey(name) && this.table.get(name) != null && name !== "IT") {
            throw new RuntimeError(line, "Redefinition of existing variable '" + name + "'");
        }

        this.table.set(name, value);
    }

    public reassign(name: string, value: any): void {
        this.table.set(name, value);
    }

    public get(line: number, name: string): any {
        if(this.containsKey(name)) {
            return this.table.get(name);
        } else throw new RuntimeError(line, "Unknown variable '" + name + "'");
    }

    public containsKey(name: string): boolean {
        return this.table.has(name);
    }

    public getTable(): Map<string, any> {
        return this.table;
    }
}