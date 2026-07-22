import RouteError from "./errors/RouteError.js";
import RouterError from "./errors/RouterError.js";
import DuplicateRouteError from "./errors/DuplicateRouteError.js";
import RouteNotFoundError from "./errors/RouteNotFoundError.js";
import Route from "./Route.js";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default class Router {
    constructor() {
        this.routes = new Map();
        this.metadata = new Map();
    }

    // ---- Helper Methods ----

    makeRouteKey(method, path) {
        return `${method.toUpperCase()}:${path}`;
    }

    setMetadata(method, path, metadata) {
        const key = this.makeRouteKey(method, path);

        if (!this.metadata.has(key)) {
            this.metadata.set(key, {
                middleware: []
            });
        }

        Object.assign(this.metadata.get(key), metadata);
    }

    getMetadata(method, path) {
        const key = this.makeRouteKey(method, path);

        return this.metadata.get(key) ?? {
            middleware: []
        };
    }

    // ---- Public API ----

    get(path, ...args) {
        return this.addRoute("GET", path, ...args);
    }

    post(path, ...args) {
        return this.addRoute("POST", path, ...args);
    }

    put(path, ...args) {
        return this.addRoute("PUT", path, ...args);
    }

    patch(path, ...args) {
        return this.addRoute("PATCH", path, ...args);
    }

    delete(path, ...args) {
        return this.addRoute("DELETE", path, ...args);
    }

    head(path, ...args) {
        return this.addRoute("HEAD", path, ...args);
    }

    options(path, ...args) {
        return this.addRoute("OPTIONS", path, ...args);
    }

    any(path, ...args) {
        for (const method of VALID_METHODS) {
            this.addRoute(method, path, ...args);
        }

        return this;
    }

    match(request) {
        this.validateRequest(request);

        const method = request.method;
        const path = request.path;

        this.validateMethod(method);
        this.validatePath(path);

        const route = this.resolve(method, path);

        if (!route.matched) {
            throw new RouteNotFoundError(method, path);
        }

        request.attributes.set("params", route.params);

        return route.route;
    }

    // ---- Registration engine ----

    addRoute(method, path, ...args) {
        const { middleware, handler } = this.normalizeArgs(args);

        const route = new Route(method, path, handler);

        this.assertNotDuplicate(route);

        if (!this.routes.has(route.method)) {
            this.routes.set(route.method, []);
        }

        this.routes.get(route.method).push(route);

        this.setMetadata(method, path, {
            middleware
        });

        return this;
    }

    normalizeArgs(args) {
        if (args.length === 1) {
            return {
                middleware: [],
                handler: args[0]
            };
        }

        const [middlewareArg, handler] = args;

        return {
            middleware: Array.isArray(middlewareArg)
                ? middlewareArg
                : [middlewareArg],
            handler
        };
    }

    // ---- Internal helpers ----

    resolve(method, path) {
        const upperMethod = method.toUpperCase();
        const candidates = this.routes.get(upperMethod);

        if (!candidates || candidates.length === 0) {
            return { matched: false };
        }

        const segmentCount = this.countSegments(path);

        for (const route of candidates) {
            if (route.segmentCount !== segmentCount) {
                continue;
            }

            if (!path.startsWith(route.staticPrefix)) {
                continue;
            }

            const params = route.match(path);
            if (params !== null) {
                return { matched: true, route, params };
            }
        }

        return { matched: false };
    }

    countSegments(path) {
        return path.split("/").filter(Boolean).length;
    }

    assertNotDuplicate(route) {
        const existing = this.routes.get(route.method);
        if (!existing) return;

        const isDuplicate = existing.some((r) => r.path === route.path);
        if (isDuplicate) {
            throw new DuplicateRouteError(route.method, route.path);
        }
    }

    // ---- Validation ----

    validateRequest(request) {
        if (
            !request ||
            typeof request.method !== "string" ||
            typeof request.path !== "string" ||
            !request.attributes ||
            typeof request.attributes.set !== "function"
        ) {
            throw new RouteError("Router.match() requires a valid Request object with method, path, and attributes.");
        }
    }

    validateMethod(method) {
        if (typeof method !== "string" || !VALID_METHODS.includes(method.toUpperCase())) {
            throw new RouteError(`Invalid HTTP method "${method}".`);
        }
    }

    validatePath(path) {
        if (typeof path !== "string" || path.trim() === "" || !path.startsWith("/")) {
            throw new RouteError(`Path must be a non-empty string starting with "/". Got "${path}".`);
        }
    }
}