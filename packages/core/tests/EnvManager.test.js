import { describe, test } from "node:test";
import assert from "node:assert/strict";
import EnvManager from "../src/env/EnvManager.js";
import EnvError from "../src/errors/EnvError.js";

describe("EnvManager", () => {

    test("set() should store a value and get() should retrieve it", () => {
        const env = new EnvManager();
        env.set("APP_NAME", "ECF");
        assert.equal(env.get("APP_NAME"), "ECF");
    });

    test("get() should return defaultValue when key does not exist", () => {
        const env = new EnvManager();
        assert.equal(env.get("MISSING_KEY", "fallback"), "fallback");
    });

    test("get() should return null by default when key does not exist", () => {
        const env = new EnvManager();
        assert.equal(env.get("MISSING_KEY"), null);
    });

    test("get() should return falsy stored values correctly", () => {
        const env = new EnvManager();
        env.set("DEBUG", false);
        env.set("PORT", 0);
        env.set("EMPTY_STRING", "");

        assert.equal(env.get("DEBUG", true), false);
        assert.equal(env.get("PORT", 3000), 0);
        assert.equal(env.get("EMPTY_STRING", "default"), "");
    });

    test("has() should correctly report key existence", () => {
        const env = new EnvManager();
        env.set("APP_ENV", "production");

        assert.equal(env.has("APP_ENV"), true);
        assert.equal(env.has("NON_EXISTENT"), false);
    });

    test("all() should return all stored key-value pairs", () => {
        const env = new EnvManager();
        env.set("A", "1").set("B", "2");

        assert.deepEqual(env.all(), { A: "1", B: "2" });
    });

    test("all() should return a copy, not a live reference", () => {
        const env = new EnvManager();
        env.set("A", "1");

        const snapshot = env.all();
        snapshot.A = "mutated";

        assert.equal(env.get("A"), "1"); // internal state should be untouched
    });

    test("clear() should remove all stored values", () => {
        const env = new EnvManager();
        env.set("A", "1").set("B", "2");
        env.clear();

        assert.deepEqual(env.all(), {});
        assert.equal(env.has("A"), false);
    });

    test("set() should support method chaining", () => {
        const env = new EnvManager();
        env.set("A", "1").set("B", "2").set("C", "3");

        assert.deepEqual(env.all(), { A: "1", B: "2", C: "3" });
    });

    test("methods should throw EnvError for invalid keys", () => {
        const env = new EnvManager();

        assert.throws(() => env.get(""), EnvError);
        assert.throws(() => env.get(null), EnvError);
        assert.throws(() => env.set("", "value"), EnvError);
        assert.throws(() => env.has(123), EnvError);
    });

});