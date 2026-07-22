import MiddlewareRegistryError from "../errors/MiddlewareRegistryError.js";
import Middleware from "../Middleware.js";

export default class MiddlewareRegistry {
    constructor() {
        this.globalMiddleware = new Set();
    }

    // ---- Global middleware ----

    global(middleware) {
        this.validateMiddleware(middleware);
        this.globalMiddleware.add(middleware);
        return this;
    }

    getGlobal() {
        return [...this.globalMiddleware];
    }

    // ---- Validation ----

    validateMiddleware(middleware) {
        const isFunction = typeof middleware === "function";
        const isMiddlewareInstance = middleware instanceof Middleware;

        if (!isFunction && !isMiddlewareInstance) {
            throw new MiddlewareRegistryError("Middleware must be a function or a Middleware instance.");
        }
    }
}