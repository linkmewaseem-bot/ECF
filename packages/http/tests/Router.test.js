import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import Router from "../src/Router.js";
import RouteError from "../src/errors/RouteError.js";
import DuplicateRouteError from "../src/errors/DuplicateRouteError.js";
import RouteNotFoundError from "../src/errors/RouteNotFoundError.js";
import Request from "../src/Request.js";

// ---- Helpers ----

function makeFakeIncomingMessage({ method = "GET", url = "/", headers = {}, socket = {} } = {}) {
    const stream = new Readable({ read() {} });
    stream.method = method;
    stream.url = url;
    stream.headers = headers;
    stream.socket = socket;
    return stream;
}

function makeFakeBodyParserManager(returnValue = {}) {
    return {
        parse: async () => returnValue
    };
}

function makeRequest({ method = "GET", url = "/" } = {}) {
    return new Request(
        makeFakeIncomingMessage({ method, url }),
        makeFakeBodyParserManager()
    );
}

// ---- Tests ----

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

        assert.doesNotThrow(() => router.match(makeRequest({ method: "GET", url: "/users" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "POST", url: "/users" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "PUT", url: "/users/1" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "PATCH", url: "/users/1" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "DELETE", url: "/users/1" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "HEAD", url: "/users" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "OPTIONS", url: "/users" })));
    });

    test("each verb method should return the router instance for chaining", () => {
        const router = new Router();
        const result = router.get("/a", () => {}).post("/b", () => {});

        assert.strictEqual(result, router);
    });

    test("any() should register the same handler across all methods", () => {
        const router = new Router();
        router.any("/ping", () => {});

        assert.doesNotThrow(() => router.match(makeRequest({ method: "GET", url: "/ping" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "POST", url: "/ping" })));
        assert.doesNotThrow(() => router.match(makeRequest({ method: "DELETE", url: "/ping" })));
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

    test("should throw RouteNotFoundError when no route matches", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.throws(
            () => router.match(makeRequest({ method: "GET", url: "/posts" })),
            RouteNotFoundError
        );
    });

    test("should throw RouteNotFoundError when method doesn't match", () => {
        const router = new Router();
        router.get("/users", () => {});

        assert.throws(
            () => router.match(makeRequest({ method: "POST", url: "/users" })),
            RouteNotFoundError
        );
    });

    test("RouteNotFoundError should carry method and path info", () => {
        const router = new Router();

        try {
            router.match(makeRequest({ method: "GET", url: "/missing" }));
            assert.fail("should have thrown");
        } catch (error) {
            assert.ok(error instanceof RouteNotFoundError);
            assert.equal(error.method, "GET");
            assert.equal(error.path, "/missing");
        }
    });

    test("should match a static route and return the Route instance", () => {
        const router = new Router();
        router.get("/users", () => {});

        const route = router.match(makeRequest({ method: "GET", url: "/users" }));
        assert.ok(route);
        assert.equal(route.path, "/users");
    });

    test("should match a static route and set empty params on request", () => {
        const router = new Router();
        router.get("/users", () => {});

        const request = makeRequest({ method: "GET", url: "/users" });
        router.match(request);

        assert.deepEqual(request.params, {});
    });

    test("should match a dynamic route and set extracted params on request", () => {
        const router = new Router();
        router.get("/users/{id}", () => {});

        const request = makeRequest({ method: "GET", url: "/users/42" });
        router.match(request);

        assert.deepEqual(request.params, { id: "42" });
    });

    test("should return the matched Route instance", () => {
        const handler = () => "handler-called";
        const router = new Router();
        router.get("/users/{id}", handler);

        const route = router.match(makeRequest({ method: "GET", url: "/users/42" }));
        assert.equal(route.handler(), "handler-called");
    });

    test("should not confuse routes with different segment counts", () => {
        const router = new Router();
        router.get("/users/{id}", () => {});
        router.get("/users/{id}/posts", () => {});

        const req1 = makeRequest({ method: "GET", url: "/users/1" });
        const route1 = router.match(req1);
        assert.deepEqual(req1.params, { id: "1" });

        const route2 = router.match(makeRequest({ method: "GET", url: "/users/1/posts" }));
        assert.equal(route2.segmentCount, 3);
    });

    test("should prefer the first matching route when multiple could match", () => {
        const router = new Router();
        router.get("/users/{id}", () => "dynamic");
        // Note: /users/me would need to be registered BEFORE /users/{id} to win,
        // since Router matches in registration order.

        const routerOrdered = new Router();
        routerOrdered.get("/users/me", () => "static-me");
        routerOrdered.get("/users/{id}", () => "dynamic");

        const route = routerOrdered.match(makeRequest({ method: "GET", url: "/users/me" }));
        assert.equal(route.handler(), "static-me");
    });

    test("should throw RouteError for invalid request argument", () => {
        const router = new Router();

        assert.throws(() => router.match(null), RouteError);
        assert.throws(() => router.match({}), RouteError);
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

        assert.equal(router.match(makeRequest({ method: "GET", url: "/" })).handler(), "home");
        assert.equal(router.match(makeRequest({ method: "GET", url: "/users" })).handler(), "user-list");
        assert.equal(router.match(makeRequest({ method: "GET", url: "/users/5" })).handler(), "user-detail");

        const reqWithParams = makeRequest({ method: "GET", url: "/users/5" });
        router.match(reqWithParams);
        assert.deepEqual(reqWithParams.params, { id: "5" });

        assert.equal(router.match(makeRequest({ method: "POST", url: "/users" })).handler(), "user-create");
        assert.equal(router.match(makeRequest({ method: "DELETE", url: "/users/5" })).handler(), "user-delete");
    });

});