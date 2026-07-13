import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
import LoggerServiceProvider from "../src/providers/LoggerServiceProvider.js";
import EventServiceProvider from "../src/providers/EventServiceProvider.js";
import Event from "../src/facade/Event.js";

describe("Event Facade - full integration", () => {

    beforeEach(() => {
        const app = new Application();
        app.register(LoggerServiceProvider); // must come before EventServiceProvider
        app.register(EventServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Event.listen() and Event.dispatch() should work through the facade", () => {
        let received = null;
        Event.listen("user.created", (payload) => { received = payload; });
        Event.dispatch("user.created", { id: 42 });

        assert.deepEqual(received, { id: 42 });
    });

    test("Event facade should resolve the same EventManager singleton across calls", () => {
        const calls = [];
        Event.listen("app.ready", () => calls.push("first"));
        Event.listen("app.ready", () => calls.push("second"));
        Event.dispatch("app.ready", {});

        assert.deepEqual(calls.sort(), ["first", "second"]);
    });

});