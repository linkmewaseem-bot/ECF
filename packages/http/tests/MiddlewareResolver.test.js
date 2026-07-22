import { describe, test } from "node:test";
import assert from "node:assert/strict";
import MiddlewareResolver from "../src/middleware/MiddlewareResolver.js";
import MiddlewareResolverError from "../src/errors/MiddlewareResolverError.js";
import MiddlewareRegistry from "../src/middleware/MiddlewareRegistry.js";
import Router from "../src/Router.js";

function makeRoute(method, path) {
    return { method, path };
}

describe("MiddlewareResolver - constructor", () => {

    test("should accept a valid router and registry", () => {
        assert.doesNotThrow(() => new MiddlewareResolver(new Router(), new MiddlewareRegistry()));
    });

    test("should throw MiddlewareResolverError if router is null or invalid", () => {
        assert.throws(() => new MiddlewareResolver(null, new MiddlewareRegistry()), MiddlewareResolverError);
        assert.throws(() => new MiddlewareResolver({}, new MiddlewareRegistry()), MiddlewareResolverError);
    });

    test("should throw MiddlewareResolverError if registry is null or invalid", () => {
        assert.throws(() => new MiddlewareResolver(new Router(), null), MiddlewareResolverError);
        assert.throws(() => new MiddlewareResolver(new Router(), {}), MiddlewareResolverError);
    });

});

describe("MiddlewareResolver - resolve()", () => {

    test("should throw MiddlewareResolverError for an invalid route", () => {
        const resolver = new MiddlewareResolver(new Router(), new MiddlewareRegistry());

        assert.throws(() => resolver.resolve(null), MiddlewareResolverError);
        assert.throws(() => resolver.resolve({}), MiddlewareResolverError);
    });

    test("should return an empty array when no middleware is registered", () => {
        const router = new Router();
        const registry = new MiddlewareRegistry();
        const resolver = new MiddlewareResolver(router, registry);
        const route = makeRoute("GET", "/");

        assert.deepEqual(resolver.resolve(route), []);
    });

    test("should return only global middleware when no route-specific middleware exists", () => {
        const router = new Router();
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.global(auth);
        registry.global(logger);

        const resolver = new MiddlewareResolver(router, registry);
        const route = makeRoute("GET", "/");

        assert.deepEqual(resolver.resolve(route), [auth, logger]);
    });

    test("should return only route middleware when no global middleware exists", () => {
        const router = new Router();
        const registry = new MiddlewareRegistry();
        const throttle = (req, next) => next();

        router.get("/admin", throttle, () => "handler");

        const resolver = new MiddlewareResolver(router, registry);
        const route = makeRoute("GET", "/admin");

        assert.deepEqual(resolver.resolve(route), [throttle]);
    });

    test("should merge global middleware before route-specific middleware", () => {
        const router = new Router();
        const registry = new MiddlewareRegistry();
        const logger = (req, next) => next();
        const auth = (req, next) => next();

        registry.global(logger);
        router.get("/admin", auth, () => "handler");

        const resolver = new MiddlewareResolver(router, registry);
        const route = makeRoute("GET", "/admin");

        assert.deepEqual(resolver.resolve(route), [logger, auth]);
    });

    test("should not leak middleware across different routes", () => {
        const router = new Router();
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        router.get("/admin", auth, () => "handler");

        const resolver = new MiddlewareResolver(router, registry);

        assert.deepEqual(resolver.resolve(makeRoute("GET", "/admin")), [auth]);
        assert.deepEqual(resolver.resolve(makeRoute("GET", "/users")), []);
    });

});