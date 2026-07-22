import { describe, test } from "node:test";
import assert from "node:assert/strict";
import MiddlewareRegistry from "../src/middleware/MiddlewareRegistry.js";
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

});