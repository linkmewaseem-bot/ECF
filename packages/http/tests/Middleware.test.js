import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Middleware from "../src/Middleware.js";
import MiddlewareError from "../src/errors/MiddlewareError.js";

describe("Middleware - base contract", () => {

    test("should construct without throwing", () => {
        assert.doesNotThrow(() => new Middleware());
    });

    test("handle() should throw MiddlewareError when not overridden", () => {
        const middleware = new Middleware();
        assert.throws(() => middleware.handle({}, {}, () => {}), MiddlewareError);
    });

    test("a subclass overriding handle() should work correctly", () => {
        class Auth extends Middleware {
            handle(request, response, next) {
                return next();
            }
        }

        const auth = new Auth();
        let called = false;

        const result = auth.handle({}, {}, () => {
            called = true;
            return "next-result";
        });

        assert.equal(called, true);
        assert.equal(result, "next-result");
        assert.ok(auth instanceof Middleware);
    });

});