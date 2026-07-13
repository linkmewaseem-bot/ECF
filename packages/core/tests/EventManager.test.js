import { describe, test } from "node:test";
import assert from "node:assert/strict";
import EventManager from "../src/events/EventManager.js";
import EventError from "../src/errors/EventError.js";

function makeFakeLogger() {
    const calls = [];
    return {
        error: (message, context) => calls.push({ message, context }),
        calls
    };
}

describe("EventManager", () => {

    test("constructor should throw if logger is invalid", () => {
        assert.throws(() => new EventManager(null), EventError);
        assert.throws(() => new EventManager({}), EventError);
        assert.throws(() => new EventManager({ error: "not a function" }), EventError);
    });

    test("listen() should register a listener and dispatch() should call it", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        let received = null;
        manager.listen("user.created", (payload) => { received = payload; });
        manager.dispatch("user.created", { id: 1 });

        assert.deepEqual(received, { id: 1 });
    });

    test("listen() should support multiple listeners for the same event", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);
        const calls = [];

        manager.listen("user.created", () => calls.push("A"));
        manager.listen("user.created", () => calls.push("B"));
        manager.dispatch("user.created", {});

        assert.deepEqual(calls.sort(), ["A", "B"]);
    });

    test("listen() should not register the exact same function reference twice", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);
        const calls = [];
        const listener = () => calls.push("called");

        manager.listen("user.created", listener);
        manager.listen("user.created", listener);
        manager.dispatch("user.created", {});

        assert.equal(calls.length, 1); // Set dedupes same reference
    });

    test("dispatch() should return empty array when no listeners are registered", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        const errors = manager.dispatch("nothing.registered", {});
        assert.deepEqual(errors, []);
    });

    test("dispatch() should continue calling remaining listeners even if one throws", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);
        const calls = [];

        manager.listen("user.created", () => calls.push("A"));
        manager.listen("user.created", () => { throw new Error("boom"); });
        manager.listen("user.created", () => calls.push("C"));

        manager.dispatch("user.created", {});

        assert.deepEqual(calls.sort(), ["A", "C"]);
    });

    test("dispatch() should collect errors from failing listeners and return them", () => {
    const logger = makeFakeLogger();
    const manager = new EventManager(logger);
    const failingListener = () => { throw new Error("listener failed"); };

    manager.listen("user.created", failingListener);
    const errors = manager.dispatch("user.created", {});

    assert.equal(errors.length, 1);
    assert.equal(errors[0].event, "user.created");
    assert.equal(errors[0].listener, failingListener);
    assert.equal(errors[0].error.message, "listener failed");
});

    test("dispatch() should log errors via the injected logger", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        manager.listen("user.created", () => { throw new Error("listener failed"); });
        manager.dispatch("user.created", {});

        assert.equal(logger.calls.length, 1);
        assert.match(logger.calls[0].message, /user\.created/);
        assert.equal(logger.calls[0].context.event, "user.created");
    });

    test("has() should correctly report event registration", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        assert.equal(manager.has("user.created"), false);
        manager.listen("user.created", () => {});
        assert.equal(manager.has("user.created"), true);
    });

    test("forget() should remove all listeners for an event", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);
        const calls = [];

        manager.listen("user.created", () => calls.push("A"));
        manager.forget("user.created");
        manager.dispatch("user.created", {});

        assert.equal(calls.length, 0);
        assert.equal(manager.has("user.created"), false);
    });

    test("clear() should remove all events and listeners", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        manager.listen("user.created", () => {});
        manager.listen("order.shipped", () => {});
        manager.clear();

        assert.equal(manager.has("user.created"), false);
        assert.equal(manager.has("order.shipped"), false);
    });

    test("listen() should throw for invalid event name or listener", () => {
        const logger = makeFakeLogger();
        const manager = new EventManager(logger);

        assert.throws(() => manager.listen("", () => {}), EventError);
        assert.throws(() => manager.listen("user.created", "not-a-function"), EventError);
    });
test("dispatch() should tag each collected error with its own listener", () => {
    const logger = makeFakeLogger();
    const manager = new EventManager(logger);

    const listenerA = () => { throw new Error("A failed"); };
    const listenerB = () => { throw new Error("B failed"); };

    manager.listen("user.created", listenerA);
    manager.listen("user.created", listenerB);

    const errors = manager.dispatch("user.created", {});

    assert.equal(errors.length, 2);

    const messages = errors.map(e => e.error.message).sort();
    assert.deepEqual(messages, ["A failed", "B failed"]);

    // Har error apne sahi listener se associated hai
    for (const { listener, error } of errors) {
        if (error.message === "A failed") assert.equal(listener, listenerA);
        if (error.message === "B failed") assert.equal(listener, listenerB);
    }
});
});