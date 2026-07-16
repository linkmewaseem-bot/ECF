import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
import {HttpServiceProvider, Route, HttpServerError } from "@ecf/http";


let app;
let server;

function bootApp() {
    app = new Application();
    app.register(HttpServiceProvider);
    app.boot();
    Facade.setApplication(app);
    return app;
}

function closeServer() {
    return new Promise((resolve) => {
        const s = app.make("http.server");
        if (s.listening) {
            s.close(resolve);
        } else {
            resolve();
        }
    });
}

describe("Application.listen() - integration", () => {

    beforeEach(() => {
        bootApp();
    });

    afterEach(async () => {
        await closeServer();
    });

    test("app.listen() should return the Application instance for chaining", async () => {
        const result = await new Promise((resolve) => {
            const r = app.listen(0, () => resolve(r));
        });

        assert.strictEqual(result, app);
    });

    test("app.listen(-1) should bubble up HttpServerError without Application validating it", () => {
        assert.throws(() => app.listen(-1), HttpServerError);
    });

    test("full flow: Route.get() + app.listen() should serve a real HTTP request", async () => {
        Route.get("/", (req, res) => {
            return res.text("Hello ECF");
        });

        await new Promise((resolve) => app.listen(0, resolve));
        const address = app.make("http.server").address();

        const body = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${address.port}/`, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => resolve(data));
            }).on("error", reject);
        });

        assert.equal(body, "Hello ECF");
    });

    test("full flow: dynamic route /users/{id} should return params as JSON", async () => {
        Route.get("/users/{id}", (req, res) => {
            return res.json(req.params);
        });

        await new Promise((resolve) => app.listen(0, resolve));
        const address = app.make("http.server").address();

        const body = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${address.port}/users/25`, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => resolve(data));
            }).on("error", reject);
        });

        assert.deepEqual(JSON.parse(body), { id: "25" });
    });

});