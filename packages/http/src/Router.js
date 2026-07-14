import RouteError from "./errors/RouteError.js";
import DuplicateRouteError from "./errors/DuplicateRouteError.js";
import Route from "./Route.js";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default class Router {
    constructor() {
        this.routes = new Map(); // Map<Method, Route[]>
    }

    // ---- Public API ----

    get(path, handler) {
        return this.addRoute("GET", path, handler);
    }

    post(path, handler) {
        return this.addRoute("POST", path, handler);
    }

    put(path, handler) {
        return this.addRoute("PUT", path, handler);
    }

    patch(path, handler) {
        return this.addRoute("PATCH", path, handler);
    }

    delete(path, handler) {
        return this.addRoute("DELETE", path, handler);
    }

    head(path, handler) {
        return this.addRoute("HEAD", path, handler);
    }

    options(path, handler) {
        return this.addRoute("OPTIONS", path, handler);
    }

    any(path, handler) {
        for (const method of VALID_METHODS) {
            this.addRoute(method, path, handler);
        }
        return this;
    }

    match(method, path) {
        this.validateMethod(method);
        this.validatePath(path);

        const upperMethod = method.toUpperCase();
        const candidates = this.routes.get(upperMethod);

        if (!candidates || candidates.length === 0) {
            return null;
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
                return { route, params };
            }
        }

        return null;
    }

    // ---- Registration engine (single source of truth) ----

    addRoute(method, path, handler) {
        const route = new Route(method, path, handler);
        this.assertNotDuplicate(route);

        if (!this.routes.has(route.method)) {
            this.routes.set(route.method, []);
        }

        this.routes.get(route.method).push(route);
        return this;
    }

    // ---- Internal helpers ----

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