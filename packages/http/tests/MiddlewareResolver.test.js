import { describe, test } from "node:test";
import assert from "node:assert/strict";
import MiddlewareResolver from "../src/MiddlewareResolver.js";
import MiddlewareResolverError from "../src/errors/MiddlewareResolverError.js";
import MiddlewareRegistry from "../src/MiddlewareRegistry.js";

function makeRoute(method, path) {
    return { method, path };
}

describe("MiddlewareResolver - constructor", () => {

    test("should accept a valid registry", () => {
        assert.doesNotThrow(() => new MiddlewareResolver(new MiddlewareRegistry()));
    });

    test("should throw MiddlewareResolverError if registry is null", () => {
        assert.throws(() => new MiddlewareResolver(null), MiddlewareResolverError);
    });

    test("should throw MiddlewareResolverError if registry lacks required methods", () => {
        assert.throws(() => new MiddlewareResolver({}), MiddlewareResolverError);
        assert.throws(() => new MiddlewareResolver({ getGlobal: () => [] }), MiddlewareResolverError);
    });

});

describe("MiddlewareResolver - resolve()", () => {

    test("should throw MiddlewareResolverError for an invalid route", () => {
        const resolver = new MiddlewareResolver(new MiddlewareRegistry());

        assert.throws(() => resolver.resolve(null), MiddlewareResolverError);
        assert.throws(() => resolver.resolve({}), MiddlewareResolverError);
    });

    test("should return an empty array when no middleware is registered", () => {
        const resolver = new MiddlewareResolver(new MiddlewareRegistry());
        const route = makeRoute("GET", "/");

        assert.deepEqual(resolver.resolve(route), []);
    });

    test("should return only global middleware when no route-specific middleware exists", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.global(auth);
        registry.global(logger);

        const resolver = new MiddlewareResolver(registry);
        const route = makeRoute("GET", "/");

        assert.deepEqual(resolver.resolve(route), [auth, logger]);
    });

    test("should return only route middleware when no global middleware exists", () => {
        const registry = new MiddlewareRegistry();
        const throttle = (req, next) => next();

        registry.route("GET", "/admin", throttle);

        const resolver = new MiddlewareResolver(registry);
        const route = makeRoute("GET", "/admin");

        assert.deepEqual(resolver.resolve(route), [throttle]);
    });

    test("should merge global middleware before route-specific middleware", () => {
        const registry = new MiddlewareRegistry();
        const logger = (req, next) => next();
        const auth = (req, next) => next();

        registry.global(logger);
        registry.route("GET", "/admin", auth);

        const resolver = new MiddlewareResolver(registry);
        const route = makeRoute("GET", "/admin");

        assert.deepEqual(resolver.resolve(route), [logger, auth]);
    });

    test("should not leak middleware across different routes", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        registry.route("GET", "/admin", auth);

        const resolver = new MiddlewareResolver(registry);

        assert.deepEqual(resolver.resolve(makeRoute("GET", "/admin")), [auth]);
        assert.deepEqual(resolver.resolve(makeRoute("GET", "/users")), []);
    });

});