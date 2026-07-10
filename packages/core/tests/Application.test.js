import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Application, ContainerError, ServiceProvider } from "../src/index.js";
import DatabaseServiceProvider from "../src/providers/DatabaseServiceProvider.js"

describe("Application - Container Delegation", () => {

    test("bind() should delegate to container and make() should resolve it", () => {
        const app = new Application();
        app.bind("logger", () => ({ log: () => "logged" }));

        const instance = app.make("logger");
        assert.equal(instance.log(), "logged");
    });

    test("singleton() should delegate to container and always return same instance", () => {
        const app = new Application();
        let counter = 0;
        app.singleton("counter", () => ({ id: ++counter }));

        const first = app.make("counter");
        const second = app.make("counter");

        assert.strictEqual(first, second);
        assert.equal(first.id, 1);
    });

    test("has() should delegate to container correctly", () => {
        const app = new Application();
        app.bind("logger", () => ({}));

        assert.equal(app.has("logger"), true);
        assert.equal(app.has("database"), false);
    });

    test("forget() should delegate and remove the binding", () => {
        const app = new Application();
        app.bind("logger", () => ({}));
        app.forget("logger");

        assert.equal(app.has("logger"), false);
        assert.throws(() => app.make("logger"), ContainerError);
    });

    test("flush() should delegate and clear all bindings", () => {
        const app = new Application();
        app.bind("logger", () => ({}));
        app.singleton("config", () => ({}));

        app.flush();

        assert.equal(app.has("logger"), false);
        assert.equal(app.has("config"), false);
    });

});

describe("Application - register()", () => {

    class FakeProvider extends ServiceProvider {
        register(app) {
            app.bind("fake", () => ({ works: true }));
        }
    }

    test("register() should accept a valid ServiceProvider subclass", () => {
        const app = new Application();
        const result = app.register(FakeProvider);

        assert.equal(app.providers.has(FakeProvider), true);
        assert.strictEqual(result, app); // should return `this` for chaining
    });

    test("register() should not add the same provider twice", () => {
        const app = new Application();
        app.register(FakeProvider);
        app.register(FakeProvider);

        assert.equal(app.providers.size, 1);
    });

    test("register() should throw if given a plain object instead of a class", () => {
        const app = new Application();
        assert.throws(() => {
            app.register({ register() {}, boot() {} });
        }, ContainerError);
    });

    test("register() should throw if class does not extend ServiceProvider", () => {
        const app = new Application();
        class NotAProvider {
            register() {}
        }

        assert.throws(() => {
            app.register(NotAProvider);
        }, ContainerError);
    });

    test("register() should throw if given null or undefined", () => {
        const app = new Application();
        assert.throws(() => app.register(null), ContainerError);
        assert.throws(() => app.register(undefined), ContainerError);
    });

});

describe("Application - boot()", () => {

    test("boot() should call register() and boot() on every provider", () => {
        const app = new Application();
        const calls = [];

        class TrackedProvider extends ServiceProvider {
            register(app) {
                calls.push("register");
                app.bind("tracked", () => ({ ok: true }));
            }
            boot(app) {
                calls.push("boot");
            }
        }

        app.register(TrackedProvider);
        app.boot();

        assert.deepEqual(calls, ["register", "boot"]);
        assert.equal(app.make("tracked").ok, true);
    });

    test("boot() should process multiple providers", () => {
        const app = new Application();
        const order = [];

        class ProviderA extends ServiceProvider {
            register() { order.push("A:register"); }
            boot() { order.push("A:boot"); }
        }

        class ProviderB extends ServiceProvider {
            register() { order.push("B:register"); }
            boot() { order.push("B:boot"); }
        }

        app.register(ProviderA);
        app.register(ProviderB);
        app.boot();

        assert.deepEqual(order, ["A:register", "A:boot", "B:register", "B:boot"]);
    });

    test("boot() should work fine with a provider that has no boot() override", () => {
        const app = new Application();

        class MinimalProvider extends ServiceProvider {
            register(app) {
                app.bind("minimal", () => ({ minimal: true }));
            }
            // boot() not overridden, uses base no-op
        }

        app.register(MinimalProvider);
        assert.doesNotThrow(() => app.boot());
        assert.equal(app.make("minimal").minimal, true);
    });

    test("boot() should return `this` for chaining", () => {
        const app = new Application();
        const result = app.boot();
        assert.strictEqual(result, app);
    });

    test("boot() with no registered providers should not throw", () => {
        const app = new Application();
        assert.doesNotThrow(() => app.boot());
    });

});

describe("Application - DatabaseServiceProvider integration", () => {

    test("DatabaseServiceProvider should register a singleton 'database' binding", async () => {
        
        const app = new Application();

        app.register(DatabaseServiceProvider);
        app.boot();

        assert.equal(app.has("database"), true);

        const db1 = app.make("database");
        const db2 = app.make("database");
        assert.strictEqual(db1, db2); // singleton check
    });

});