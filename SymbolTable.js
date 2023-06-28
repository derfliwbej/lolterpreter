import { RuntimeError } from './RuntimeError.js';
export class SymbolTable {
    constructor() {
        this.table = new Map();
        this.assign(0, "IT", null);
    }
    assign(line, name, value) {
        if (this.containsKey(name) && this.table.get(name) != null && name !== "IT") {
            throw new RuntimeError(line, "Redefinition of existing variable '" + name + "'");
        }
        this.table.set(name, value);
    }
    reassign(name, value) {
        this.table.set(name, value);
    }
    get(line, name) {
        if (this.containsKey(name)) {
            return this.table.get(name);
        }
        else
            throw new RuntimeError(line, "Unknown variable '" + name + "'");
    }
    containsKey(name) {
        return this.table.has(name);
    }
    getTable() {
        return this.table;
    }
}
