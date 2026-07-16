import MiddlewareRegistryError from "./errors/MiddlewareRegistryError.js";

export default class MiddlewareRegistry {
    constructor() {
        this.globalMiddleware = new Set();
        this.routeMiddleware = new Map(); // Map<"METHOD:path", Set<Function>>
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

    // ---- Route-specific middleware ----

    route(method, path, middleware) {
        this.validateMethod(method);
        this.validatePath(path);
        this.validateMiddleware(middleware);

        const key = this.makeKey(method, path);

        if (!this.routeMiddleware.has(key)) {
            this.routeMiddleware.set(key, new Set());
        }

        this.routeMiddleware.get(key).add(middleware);
        return this;
    }

    getRoute(method, path) {
        this.validateMethod(method);
        this.validatePath(path);

        const key = this.makeKey(method, path);
        const middlewareSet = this.routeMiddleware.get(key);

        return middlewareSet ? [...middlewareSet] : [];
    }

    // ---- Internal helpers ----

    makeKey(method, path) {
        return `${method.toUpperCase()}:${path}`;
    }

    // ---- Validation ----

    validateMiddleware(middleware) {
        if (typeof middleware !== "function") {
            throw new MiddlewareRegistryError("Middleware must be a function.");
        }
    }

    validateMethod(method) {
        if (typeof method !== "string" || method.trim() === "") {
            throw new MiddlewareRegistryError("Method must be a non-empty string.");
        }
    }

    validatePath(path) {
        if (typeof path !== "string" || path.trim() === "") {
            throw new MiddlewareRegistryError("Path must be a non-empty string.");
        }
    }
}