import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import {Application, Facade} from "@ecf/core";
import HttpServiceProvider from "../src/providers/HttpServiceProvider.js";
import Route from "../src/facades/Route.js";
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

describe("Route Facade - full integration", () => {

    beforeEach(() => {
        const app = new Application();
        app.register(HttpServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Route.get() should register a route through the facade", () => {
        Route.get("/users", () => "user-list");

        const route = Route.match(makeRequest({ method: "GET", url: "/users" }));
        assert.equal(route.handler(), "user-list");
    });

    test("Route.post() should register a route through the facade", () => {
        Route.post("/users", () => "user-create");

        const route = Route.match(makeRequest({ method: "POST", url: "/users" }));
        assert.equal(route.handler(), "user-create");
    });

    test("Route facade should resolve the same Router singleton across calls", () => {
        Route.get("/a", () => "a");
        Route.get("/b", () => "b");

        assert.equal(Route.match(makeRequest({ method: "GET", url: "/a" })).handler(), "a");
        assert.equal(Route.match(makeRequest({ method: "GET", url: "/b" })).handler(), "b");
    });

    test("Route.get() with dynamic params should work end-to-end through the facade", () => {
        Route.get("/users/{id}", (req) => `user-${req?.params?.id}`);

        const request = makeRequest({ method: "GET", url: "/users/42" });
        Route.match(request);
        assert.deepEqual(request.params, { id: "42" });
    });

    test("duplicate route registration through the facade should throw", () => {
        Route.get("/duplicate", () => {});

        assert.throws(() => {
            Route.get("/duplicate", () => {});
        });
    });

});