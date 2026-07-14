import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {Application, Facade} from "@ecf/core";
//import Facade from "@ecf/core/Facade.js";
import HttpServiceProvider from "../src/providers/HttpServiceProvider.js";
import Route from "../src/facades/Route.js";

describe("Route Facade - full integration", () => {

    beforeEach(() => {
        const app = new Application();
        app.register(HttpServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Route.get() should register a route through the facade", () => {
        Route.get("/users", () => "user-list");

        const result = Route.match("GET", "/users");
        assert.equal(result.route.handler(), "user-list");
    });

    test("Route.post() should register a route through the facade", () => {
        Route.post("/users", () => "user-create");

        const result = Route.match("POST", "/users");
        assert.equal(result.route.handler(), "user-create");
    });

    test("Route facade should resolve the same Router singleton across calls", () => {
        Route.get("/a", () => "a");
        Route.get("/b", () => "b");

        assert.equal(Route.match("GET", "/a").route.handler(), "a");
        assert.equal(Route.match("GET", "/b").route.handler(), "b");
    });

    test("Route.get() with dynamic params should work end-to-end through the facade", () => {
        Route.get("/users/{id}", (req) => `user-${req?.params?.id}`);

        const result = Route.match("GET", "/users/42");
        assert.deepEqual(result.params, { id: "42" });
    });

    test("duplicate route registration through the facade should throw", () => {
        Route.get("/duplicate", () => {});

        assert.throws(() => {
            Route.get("/duplicate", () => {});
        });
    });

});