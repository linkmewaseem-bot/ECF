import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
// ✅ Ye likho
import { HttpServiceProvider, CoreServiceProvider, Route } from "@ecf/http";
import http from "node:http";

let app;

function bootApp() {
    app = new Application();
    app.register(CoreServiceProvider);
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

describe("Application.use() - integration", () => {

    beforeEach(() => {
        bootApp();
    });

    afterEach(async () => {
        await closeServer();
    });

    test("app.use() should return the Application instance for chaining", () => {
        const result = app.use((req, res, next) => next());
        assert.strictEqual(result, app);
    });

    test("app.use() should register middleware into the global middleware registry", () => {
        const fn = (req, res, next) => next();
        app.use(fn);

        const registry = app.make("middleware.registry");
        assert.deepEqual(registry.getGlobal(), [fn]);
    });

    test("full flow: app.use() middleware should run before the route handler on a real request", async () => {
        const log = [];

        app.use((req, res, next) => {
            log.push("logger");
            return next();
        });

        Route.get("/", (req, res) => {
            log.push("handler");
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
        assert.deepEqual(log, ["logger", "handler"]);
    });

    test("app.use() middleware should be able to short-circuit a real request", async () => {
        app.use((req, res, next) => {
            return res.status(401).text("Unauthorized");
        });

        Route.get("/", (req, res) => {
            return res.text("Should not reach here");
        });

        await new Promise((resolve) => app.listen(0, resolve));
        const address = app.make("http.server").address();

        const { statusCode, body } = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${address.port}/`, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
            }).on("error", reject);
        });

        assert.equal(statusCode, 401);
        assert.equal(body, "Unauthorized");
    });

});