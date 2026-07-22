import MiddlewareResolverError from "../errors/MiddlewareResolverError.js";

export default class MiddlewareResolver {
    constructor(router, registry) {
        this.validateRouter(router);
        this.validateRegistry(registry);
        this.router = router;
        this.registry = registry;
    }

    resolve(request) {
        this.validateRequest(request);

        return [
            ...this.registry.getGlobal(),
            ...this.router.getMetadata(
                request.method,
                request.path
            ).middleware
        ];
    }

    validateRouter(router) {
        if (!router || typeof router.getMetadata !== "function") {
            throw new MiddlewareResolverError("MiddlewareResolver requires a Router with a getMetadata() method.");
        }
    }

    validateRegistry(registry) {
        if (!registry || typeof registry.getGlobal !== "function") {
            throw new MiddlewareResolverError("MiddlewareResolver requires a MiddlewareRegistry with a getGlobal() method.");
        }
    }

    validateRequest(request) {
        if (!request || typeof request.method !== "string" || typeof request.path !== "string") {
            throw new MiddlewareResolverError("MiddlewareResolver.resolve() requires a valid request or route object with method and path.");
        }
    }
}