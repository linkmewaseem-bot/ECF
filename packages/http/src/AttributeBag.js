export default class AttributeBag {
    constructor() {
        this.items = new Map();
    }

    set(key, value) {
        this.validateKey(key);
        this.items.set(key, value);
        return this;
    }

    get(key, defaultValue = null) {
        this.validateKey(key);
        return this.items.has(key) ? this.items.get(key) : defaultValue;
    }

    has(key) {
        this.validateKey(key);
        return this.items.has(key);
    }

    remove(key) {
        this.validateKey(key);
        this.items.delete(key);
        return this;
    }

    clear() {
        this.items.clear();
        return this;
    }

    all() {
        return Object.fromEntries(this.items);
    }

    validateKey(key) {
        if (typeof key !== "string" || key.trim() === "") {
            throw new Error("Attribute key must be a non-empty string.");
        }
    }
}