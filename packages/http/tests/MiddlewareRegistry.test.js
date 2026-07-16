import { describe, test } from "node:test";
import assert from "node:assert/strict";
import MiddlewareRegistry from "../src/MiddlewareRegistry.js";
import MiddlewareRegistryError from "../src/errors/MiddlewareRegistryError.js";

describe("MiddlewareRegistry - global()", () => {

    test("should register a middleware function", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        assert.doesNotThrow(() => registry.global(auth));
    });

    test("should return the registry instance for chaining", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        const result = registry.global(auth);
        assert.strictEqual(result, registry);
    });

    test("should throw MiddlewareRegistryError if middleware is not a function", () => {
        const registry = new MiddlewareRegistry();

        assert.throws(() => registry.global("not-a-function"), MiddlewareRegistryError);
        assert.throws(() => registry.global(null), MiddlewareRegistryError);
        assert.throws(() => registry.global({}), MiddlewareRegistryError);
    });

    test("should not register the exact same function reference twice", () => {
        const registry = new MiddlewareRegistry();
        const logger = (req, next) => next();

        registry.global(logger);
        registry.global(logger);

        assert.equal(registry.getGlobal().length, 1);
    });

    test("should allow multiple distinct middleware functions", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.global(auth).global(logger);

        assert.equal(registry.getGlobal().length, 2);
    });

});

describe("MiddlewareRegistry - getGlobal()", () => {

    test("should return an empty array when nothing is registered", () => {
        const registry = new MiddlewareRegistry();
        assert.deepEqual(registry.getGlobal(), []);
    });

    test("should return middleware in registration order", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.global(auth);
        registry.global(logger);

        assert.deepEqual(registry.getGlobal(), [auth, logger]);
    });

    test("should return a copy, not a live reference to internal storage", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        registry.global(auth);
        const result = registry.getGlobal();
        result.push((req, next) => next());

        assert.equal(registry.getGlobal().length, 1);
    });
describe("MiddlewareRegistry - route()", () => {

    test("should register a middleware for a specific method+path", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        assert.doesNotThrow(() => registry.route("GET", "/admin", auth));
    });

    test("should return the registry instance for chaining", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        const result = registry.route("GET", "/admin", auth);
        assert.strictEqual(result, registry);
    });

    test("should throw MiddlewareRegistryError for invalid method/path/middleware", () => {
        const registry = new MiddlewareRegistry();
        const fn = (req, next) => next();

        assert.throws(() => registry.route("", "/admin", fn), MiddlewareRegistryError);
        assert.throws(() => registry.route("GET", "", fn), MiddlewareRegistryError);
        assert.throws(() => registry.route("GET", "/admin", "not-a-function"), MiddlewareRegistryError);
    });

    test("should not register the same middleware twice for the same route", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        registry.route("GET", "/admin", auth);
        registry.route("GET", "/admin", auth);

        assert.equal(registry.getRoute("GET", "/admin").length, 1);
    });

    test("method matching should be case-insensitive", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        registry.route("get", "/admin", auth);

        assert.equal(registry.getRoute("GET", "/admin").length, 1);
    });

});

describe("MiddlewareRegistry - getRoute()", () => {

    test("should return an empty array for a route with no middleware", () => {
        const registry = new MiddlewareRegistry();
        assert.deepEqual(registry.getRoute("GET", "/nothing"), []);
    });

    test("should return middleware in registration order", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.route("GET", "/admin", auth);
        registry.route("GET", "/admin", logger);

        assert.deepEqual(registry.getRoute("GET", "/admin"), [auth, logger]);
    });

    test("should not mix middleware between different routes", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();
        const logger = (req, next) => next();

        registry.route("GET", "/admin", auth);
        registry.route("POST", "/users", logger);

        assert.deepEqual(registry.getRoute("GET", "/admin"), [auth]);
        assert.deepEqual(registry.getRoute("POST", "/users"), [logger]);
        assert.deepEqual(registry.getRoute("GET", "/users"), []);
    });

    test("should return a copy, not a live reference to internal storage", () => {
        const registry = new MiddlewareRegistry();
        const auth = (req, next) => next();

        registry.route("GET", "/admin", auth);
        const result = registry.getRoute("GET", "/admin");
        result.push((req, next) => next());

        assert.equal(registry.getRoute("GET", "/admin").length, 1);
    });

});
});