import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
import LoggerServiceProvider from "../src/providers/LoggerServiceProvider.js";
import Log from "../src/facade/Log.js";

describe("Log Facade - full integration", () => {
    let originalInfo, originalWarn, originalError;
    let captured;

    beforeEach(() => {
        const app = new Application();
        app.register(LoggerServiceProvider);
        app.boot();
        Facade.setApplication(app);

        // console methods spy karo
        captured = { info: [], warn: [], error: [] };
        originalInfo = console.info;
        originalWarn = console.warn;
        originalError = console.error;

        console.info = (msg) => captured.info.push(msg);
        console.warn = (msg) => captured.warn.push(msg);
        console.error = (msg) => captured.error.push(msg);
    });

    afterEach(() => {
        console.info = originalInfo;
        console.warn = originalWarn;
        console.error = originalError;
    });

    test("Log.info() should call console.info", () => {
        Log.info("ECF Started");
        assert.equal(captured.info.length, 1);
        assert.match(captured.info[0], /ECF Started/);
    });

    test("Log.warning() should call console.warn", () => {
        Log.warning("Disk space low");
        assert.equal(captured.warn.length, 1);
        assert.match(captured.warn[0], /Disk space low/);
    });

    test("Log.error() should call console.error", () => {
        Log.error("Database failed");
        assert.equal(captured.error.length, 1);
        assert.match(captured.error[0], /Database failed/);
    });

    test("Log.critical() should also call console.error", () => {
        Log.critical("Payment gateway down");
        assert.equal(captured.error.length, 1);
        assert.match(captured.error[0], /Payment gateway down/);
    });

    test("Log messages should include context in output", () => {
        Log.info("User logged in", { userId: 42 });
        assert.match(captured.info[0], /"userId":42/);
    });
});