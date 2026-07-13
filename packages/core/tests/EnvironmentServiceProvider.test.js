import { describe, test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Application from "../src/Application.js";
import Facade from "../src/Facade.js";
import EnvironmentServiceProvider from "../src/providers/EnvironmentServiceProvider.js";
import Env from "../src/facade/Env.js";

const ENV_PATH = path.join(process.cwd(), ".env");
const BACKUP_PATH = path.join(process.cwd(), ".env.backup-for-tests");

describe("EnvironmentServiceProvider - integration", () => {

    before(() => {
        // Agar real .env exist karta hai to backup le lo
        if (fs.existsSync(ENV_PATH)) {
            fs.renameSync(ENV_PATH, BACKUP_PATH);
        }

        fs.writeFileSync(ENV_PATH, [
            "APP_NAME=ECF",
            "APP_ENV=testing",
        ].join("\n"));
    });

    after(() => {
        fs.rmSync(ENV_PATH, { force: true });
        if (fs.existsSync(BACKUP_PATH)) {
            fs.renameSync(BACKUP_PATH, ENV_PATH);
        }
        delete process.env.APP_NAME;
        delete process.env.APP_ENV;
    });

    beforeEach(() => {
        const app = new Application();
        app.register(EnvironmentServiceProvider);
        app.boot();
        Facade.setApplication(app);
    });

    test("Env.get() should read values loaded from .env file", () => {
        assert.equal(Env.get("APP_NAME"), "ECF");
        assert.equal(Env.get("APP_ENV"), "testing");
    });

    test("Env.get() should return defaultValue for missing keys", () => {
        assert.equal(Env.get("MISSING_KEY", "fallback"), "fallback");
    });

    test(".env values should also be merged into process.env", () => {
        assert.equal(process.env.APP_NAME, "ECF");
        assert.equal(process.env.APP_ENV, "testing");
    });

    test("process.env should not be overwritten if already set", () => {
        process.env.APP_NAME = "ExistingSystemValue";

        const app = new Application();
        app.register(EnvironmentServiceProvider);
        app.boot();
        Facade.setApplication(app);

        // process.env should keep the pre-existing value
        assert.equal(process.env.APP_NAME, "ExistingSystemValue");

        // But EnvManager should still have loaded the .env value internally
        assert.equal(Env.get("APP_NAME"), "ECF");
    });

});