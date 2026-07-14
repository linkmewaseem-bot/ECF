import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Router from "../src/Router.js";
import RouteError from "../src/errors/RouteError.js";
import DuplicateRouteError from "../src/errors/DuplicateRouteError.js";

describe("Router - HTTP verb methods", () => {

    test("get(), post(), put(), patch(), delete(), head(), options() should register routes", () => {
        const router = new Router();

        router.get("/users", () => {});
        router.post("/users", () => {});
        router.put("/users/{id}", () => {});
        router.patch("/users/{id}", () => {});
        router.delete("/users/{id}", () => {});
        router.head("/users", () => {});
        router.options("/users", () => {});

        assert.equal(router.match("GET", "/users") !== null, true);
        assert.equal(router.match("POST", "/users") !== null, true);
        assert.equal(router.match("PUT", "/users/1") !== null, true);
        assert.equal(router.match("PATCH", "/users/1") !== null, true);
        assert.equal(router.match("DELETE", "/users/1") !== null, true);
        assert.equal(router.match("HEAD", "/users") !== null, true);
        assert.equal(router.match("OPTIONS", "/users") !== null, true);
    });

    test("each verb method should return the router instance for chaining", () => {
        const router = new Router();
        const result = router.get("/a", () => {}).post("/b", () => {});

        assert.strictEqual(result, router);
    });

    test("any() should register the same handler across all methods", () => {
        const router = new Router();
        router.any("/ping", () => {});

        assert.equal(router.match("GET", "/ping") !== null, true);
        assert.equal(router.match("POST", "/ping") !== null, true);
        assert.equal(router.match("DELETE", "/ping") !== null, true);
    });

});

describe("Router - duplicate route detection", () => {

    test("should throw DuplicateRouteError when the same method+path is registered twice", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.throws(() => {
            router.get("/users", () => {});
        }, DuplicateRouteError);
    });

    test("should allow the same path on different methods", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.doesNotThrow(() => {
            router.post("/users", () => {});
        });
    });

    test("DuplicateRouteError should carry method and path info", () => {
        const router = new Router();
        router.get("/users", () => {});

        try {
            router.get("/users", () => {});
            assert.fail("should have thrown");
        } catch (error) {
            assert.equal(error.method, "GET");
            assert.equal(error.path, "/users");
        }
    });

});

describe("Router - match()", () => {

    test("should return null when no route matches", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.equal(router.match("GET", "/posts"), null);
    });

    test("should return null when method doesn't match", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.equal(router.match("POST", "/users"), null);
    });

    test("should match a static route and return empty params", () => {
        const router = new Router();
        router.get("/users", () => {});

        const result = router.match("GET", "/users");
        assert.deepEqual(result.params, {});
    });

    test("should match a dynamic route and extract params", () => {
        const router = new Router();
        router.get("/users/{id}", () => {});

        const result = router.match("GET", "/users/42");
        assert.deepEqual(result.params, { id: "42" });
    });

    test("should return the matched Route instance along with params", () => {
        const handler = () => "handler-called";
        const router = new Router();
        router.get("/users/{id}", handler);

        const result = router.match("GET", "/users/42");
        assert.equal(result.route.handler(), "handler-called");
    });

    test("should not confuse routes with different segment counts", () => {
        const router = new Router();
        router.get("/users/{id}", () => {});
        router.get("/users/{id}/posts", () => {});

        const result = router.match("GET", "/users/1");
        assert.deepEqual(result.params, { id: "1" });

        const result2 = router.match("GET", "/users/1/posts");
        assert.equal(result2.route.segmentCount, 3);
    });

    test("should prefer the first matching route when multiple could match", () => {
        const router = new Router();
        router.get("/users/{id}", () => "dynamic");
        // Note: /users/me would need to be registered BEFORE /users/{id} to win,
        // since Router matches in registration order.

        const routerOrdered = new Router();
        routerOrdered.get("/users/me", () => "static-me");
        routerOrdered.get("/users/{id}", () => "dynamic");

        const result = routerOrdered.match("GET", "/users/me");
        assert.equal(result.route.handler(), "static-me");
    });

    test("should throw RouteError for invalid method in match()", () => {
        const router = new Router();
        assert.throws(() => router.match("INVALID", "/users"), RouteError);
    });

    test("should throw RouteError for invalid path in match()", () => {
        const router = new Router();
        assert.throws(() => router.match("GET", ""), RouteError);
        assert.throws(() => router.match("GET", "no-leading-slash"), RouteError);
    });

});

describe("Router - integration", () => {

    test("full flow: register multiple routes and match correctly", () => {
        const router = new Router();

        router.get("/", () => "home");
        router.get("/users", () => "user-list");
        router.get("/users/{id}", () => "user-detail");
        router.post("/users", () => "user-create");
        router.delete("/users/{id}", () => "user-delete");

        assert.equal(router.match("GET", "/").route.handler(), "home");
        assert.equal(router.match("GET", "/users").route.handler(), "user-list");
        assert.equal(router.match("GET", "/users/5").route.handler(), "user-detail");
        assert.deepEqual(router.match("GET", "/users/5").params, { id: "5" });
        assert.equal(router.match("POST", "/users").route.handler(), "user-create");
        assert.equal(router.match("DELETE", "/users/5").route.handler(), "user-delete");
    });

});