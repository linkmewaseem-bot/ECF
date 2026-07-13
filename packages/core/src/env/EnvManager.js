import EnvError from "../errors/EnvError.js";

export default class EnvManager {
    constructor() {
        this.items = {};
    }

    get(key, defaultValue = null) {
        this.validateKey(key);

        return Object.prototype.hasOwnProperty.call(this.items, key)
            ? this.items[key]
            : defaultValue;
    }

    set(key, value) {
        this.validateKey(key);
        this.items[key] = value;
        return this;
    }

    has(key) {
        this.validateKey(key);
        return Object.prototype.hasOwnProperty.call(this.items, key);
    }

    all() {
        return { ...this.items }; // shallow copy — internal state protect karne ke liye
    }

   clear() {
        this.items = {};
        return this;
    }

    validateKey(key) {
        if (typeof key !== "string" || key.trim() === "") {
            throw new EnvError("Env key must be a non-empty string.");
        }
    }
}