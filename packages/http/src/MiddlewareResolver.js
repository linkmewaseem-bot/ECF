import MiddlewareResolverError from "./errors/MiddlewareResolverError.js";

export default class MiddlewareResolver {
    constructor(registry) {
        this.validateRegistry(registry);
        this.registry = registry;
    }

    resolve(route) {
        this.validateRoute(route);

        return [
            ...this.registry.getGlobal(),
            ...this.registry.getRoute(route.method, route.path)
        ];
    }

    validateRegistry(registry) {
        if (
            !registry ||
            typeof registry.getGlobal !== "function" ||
            typeof registry.getRoute !== "function"
        ) {
            throw new MiddlewareResolverError("MiddlewareResolver requires a MiddlewareRegistry with getGlobal() and getRoute() methods.");
        }
    }

    validateRoute(route) {
        if (!route || typeof route.method !== "string" || typeof route.path !== "string") {
            throw new MiddlewareResolverError("MiddlewareResolver.resolve() requires a valid Route with method and path.");
        }
    }
}