// tests/Config.test.js
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ConfigManager, ConfigError } from "../src/index.js";

describe("ConfigManager - set()", () => {

    test("set() should store a top-level value", () => {
        const config = new ConfigManager();
        config.set("name", "ECF");
        assert.equal(config.items.name, "ECF");
    });

    test("set() should create nested objects for dot-notation paths", () => {
        const config = new ConfigManager();
        config.set("app.name", "ECF");
        assert.deepEqual(config.items, { app: { name: "ECF" } });
    });

    test("set() should support method chaining", () => {
        const config = new ConfigManager();
        config
            .set("app.name", "ECF")
            .set("app.version", "0.1.0")
            .set("database.host", "localhost");

        assert.deepEqual(config.items, {
            app: { name: "ECF", version: "0.1.0" },
            database: { host: "localhost" }
        });
    });

    test("set() should overwrite a non-object value with an object when going deeper", () => {
        const config = new ConfigManager();
        config.set("app", "notAnObject");
        config.set("app.name", "ECF");

        assert.deepEqual(config.items, { app: { name: "ECF" } });
    });

    test("set() should throw ConfigError for invalid path", () => {
        const config = new ConfigManager();
        assert.throws(() => config.set("", "value"), ConfigError);
        assert.throws(() => config.set(null, "value"), ConfigError);
        assert.throws(() => config.set(123, "value"), ConfigError);
    });

});

describe("ConfigManager - get()", () => {

    test("get() should retrieve a top-level value", () => {
        const config = new ConfigManager();
        config.set("name", "ECF");
        assert.equal(config.get("name"), "ECF");
    });

    test("get() should retrieve a nested value", () => {
        const config = new ConfigManager();
        config.set("app.database.host", "localhost");
        assert.equal(config.get("app.database.host"), "localhost");
    });

    test("get() should return defaultValue when path does not exist", () => {
        const config = new ConfigManager();
        assert.equal(config.get("missing.path", "fallback"), "fallback");
    });

    test("get() should return null by default when path does not exist and no default given", () => {
        const config = new ConfigManager();
        assert.equal(config.get("missing.path"), null);
    });

    test("get() should return falsy stored values correctly (not fallback to default)", () => {
        const config = new ConfigManager();
        config.set("app.debug", false);
        config.set("cache.ttl", 0);
        config.set("app.name", "");

        assert.equal(config.get("app.debug", true), false);
        assert.equal(config.get("cache.ttl", 60), 0);
        assert.equal(config.get("app.name", "default"), "");
    });

    test("get() should return defaultValue if intermediate path is not an object", () => {
        const config = new ConfigManager();
        config.set("app", "notAnObject");
        assert.equal(config.get("app.name", "fallback"), "fallback");
    });

    test("get() should throw ConfigError for invalid path", () => {
        const config = new ConfigManager();
        assert.throws(() => config.get(""), ConfigError);
        assert.throws(() => config.get(null), ConfigError);
    });

});