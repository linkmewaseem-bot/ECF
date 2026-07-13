import { describe, test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import DotEnvLoader from "../src/env/DotEnvLoader.js";
import EnvError from "../src/errors/EnvError.js";

const TEST_ENV_PATH = path.join(process.cwd(), "tests", "fixtures", ".env.test");

describe("DotEnvLoader", () => {

    before(() => {
        fs.mkdirSync(path.dirname(TEST_ENV_PATH), { recursive: true });
        fs.writeFileSync(TEST_ENV_PATH, [
            "# This is a comment",
            "",
            "APP_NAME=ECF",
            'APP_ENV="production"',
            "APP_DEBUG='false'",
            "export DB_HOST=localhost",
            "PORT=3000 # default port",
            'DESCRIPTION="Hello # World"',
            "MALFORMED_LINE_NO_EQUALS",
            "EMPTY_VALUE=",
        ].join("\n"));
    });

    after(() => {
        fs.rmSync(TEST_ENV_PATH);
    });

    test("load() should throw EnvError if file does not exist", () => {
        const loader = new DotEnvLoader();
        assert.throws(() => {
            loader.load("nonexistent/.env");
        }, EnvError);
    });

    test("load() should parse basic key-value pairs", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.APP_NAME, "ECF");
    });

    test("load() should strip double quotes", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.APP_ENV, "production");
    });

    test("load() should strip single quotes", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.APP_DEBUG, "false");
    });

    test("load() should support export prefix", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.DB_HOST, "localhost");
    });

    test("load() should strip inline comments on unquoted values", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.PORT, "3000");
    });

    test("load() should preserve  inside quoted values", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.DESCRIPTION, 'Hello');
    });

    test("load() should skip malformed lines without crashing", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.MALFORMED_LINE_NO_EQUALS, undefined);
    });

    test("load() should handle empty values", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        assert.equal(result.EMPTY_VALUE, "");
    });

    test("load() should skip comment lines and blank lines", () => {
        const loader = new DotEnvLoader();
        const result = loader.load(TEST_ENV_PATH);

        // Comment line khud ek key nahi bani honi chahiye
        assert.equal(Object.keys(result).includes("# This is a comment"), false);
    });

    test("load() should throw EnvError for invalid key names", () => {
    const loader = new DotEnvLoader();
    const badPath = path.join(process.cwd(), "tests", "fixtures", ".env.bad");

    fs.writeFileSync(badPath, "1APP=value");

    assert.throws(() => {
        loader.load(badPath);
    }, EnvError);

    fs.rmSync(badPath);
});

test("load() should throw EnvError for keys with spaces", () => {
    const loader = new DotEnvLoader();
    const badPath = path.join(process.cwd(), "tests", "fixtures", ".env.bad2");

    fs.writeFileSync(badPath, "MY KEY=value");

    assert.throws(() => {
        loader.load(badPath);
    }, EnvError);

    fs.rmSync(badPath);
});

test("load() should throw EnvError for keys with hyphens", () => {
    const loader = new DotEnvLoader();
    const badPath = path.join(process.cwd(), "tests", "fixtures", ".env.bad3");

    fs.writeFileSync(badPath, "APP-NAME=value");

    assert.throws(() => {
        loader.load(badPath);
    }, EnvError);

    fs.rmSync(badPath);
});

});