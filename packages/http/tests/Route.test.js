import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Route from "../src/Route.js";
import RouteError from "../src/errors/RouteError.js";

describe("Route - constructor validation", () => {

    test("should throw RouteError for invalid method", () => {
        assert.throws(() => new Route("INVALID", "/users", () => {}), RouteError);
        assert.throws(() => new Route(123, "/users", () => {}), RouteError);
    });

    test("should throw RouteError for invalid path", () => {
        assert.throws(() => new Route("GET", "", () => {}), RouteError);
        assert.throws(() => new Route("GET", "users", () => {}), RouteError); // missing leading /
        assert.throws(() => new Route("GET", null, () => {}), RouteError);
    });

    test("should throw RouteError for invalid handler", () => {
        assert.throws(() => new Route("GET", "/users", "not-a-function"), RouteError);
        assert.throws(() => new Route("GET", "/users", null), RouteError);
        assert.throws(() => new Route("GET", "/users", [123, "index"]), RouteError);
    });

    test("should accept a valid function handler", () => {
        assert.doesNotThrow(() => new Route("GET", "/users", () => {}));
    });

    test("should uppercase the method", () => {
        const route = new Route("get", "/users", () => {});
        assert.equal(route.method, "GET");
    });

});

describe("Route - compilation", () => {

    test("should compile a static path with no parameters", () => {
        const route = new Route("GET", "/users", () => {});

        assert.deepEqual(route.parameterNames, []);
        assert.equal(route.segmentCount, 1);
        assert.equal(route.staticPrefix, "/users");
    });

    test("should compile a dynamic path with one parameter", () => {
        const route = new Route("GET", "/users/{id}", () => {});

        assert.deepEqual(route.parameterNames, ["id"]);
        assert.equal(route.segmentCount, 2);
    });

    test("should compile a path with multiple parameters", () => {
        const route = new Route("GET", "/users/{userId}/posts/{postId}", () => {});

        assert.deepEqual(route.parameterNames, ["userId", "postId"]);
    });

    test("should compute staticPrefix as segments before the first parameter", () => {
        const route = new Route("GET", "/api/users/{id}/profile", () => {});
        assert.equal(route.staticPrefix, "/api/users");
    });

    test("should escape special regex characters in static segments", () => {
        const route = new Route("GET", "/files/report.pdf", () => {});

        assert.equal(route.match("/files/report.pdf") !== null, true);
        assert.equal(route.match("/files/reportXpdf"), null); // literal dot, not regex any-char
    });

});

describe("Route - match()", () => {

    test("should match a static path exactly", () => {
        const route = new Route("GET", "/users", () => {});

        assert.deepEqual(route.match("/users"), {});
        assert.equal(route.match("/users/1"), null);
    });

    test("should extract a single parameter", () => {
        const route = new Route("GET", "/users/{id}", () => {});

        assert.deepEqual(route.match("/users/25"), { id: "25" });
    });

    test("should extract multiple parameters", () => {
        const route = new Route("GET", "/users/{userId}/posts/{postId}", () => {});

        assert.deepEqual(route.match("/users/1/posts/99"), { userId: "1", postId: "99" });
    });

    test("should return null for a non-matching path", () => {
        const route = new Route("GET", "/users/{id}", () => {});

        assert.equal(route.match("/posts/1"), null);
        assert.equal(route.match("/users/1/extra"), null);
    });

});

describe("Route - handler normalization", () => {

    test("should keep a plain function handler as-is", () => {
        const handler = () => "result";
        const route = new Route("GET", "/users", handler);

        assert.equal(route.handler(), "result");
    });

    test("should bind a [Controller, method] tuple into a callable function", () => {
        class UserController {
            index() {
                return "index called";
            }
        }

        const route = new Route("GET", "/users", [UserController, "index"]);
        assert.equal(typeof route.handler, "function");
        assert.equal(route.handler(), "index called");
    });

    test("should throw RouteError if the controller method does not exist", () => {
        class UserController {}

        assert.throws(() => new Route("GET", "/users", [UserController, "missing"]), RouteError);
    });

});

describe("Route - immutability", () => {

    test("should be frozen after construction", () => {
        const route = new Route("GET", "/users", () => {});

        assert.throws(() => { "use strict"; route.method = "POST"; }, TypeError);
        assert.equal(Object.isFrozen(route), true);
    });

});