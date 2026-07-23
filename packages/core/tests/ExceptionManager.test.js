import { describe, test } from "node:test";
import assert from "node:assert/strict";
import ExceptionManager from "../src/ExceptionManager.js";
import ExceptionManagerError from "../src/errors/ExceptionManagerError.js";

describe("ExceptionManager - render()", () => {

    test("should register and resolve a renderer", () => {
        const manager = new ExceptionManager();
        class ValidationError extends Error {}
        const renderer = () => {};

        manager.render(ValidationError, renderer);

        assert.strictEqual(manager.resolveRenderer(new ValidationError()), renderer);
    });

    test("should return null if no renderer matches", () => {
        const manager = new ExceptionManager();
        assert.equal(manager.resolveRenderer(new Error()), null);
    });

    test("should throw for invalid ErrorClass or renderer", () => {
        const manager = new ExceptionManager();
        assert.throws(() => manager.render("not-a-class", () => {}), ExceptionManagerError);
        assert.throws(() => manager.render(Error, "not-a-function"), ExceptionManagerError);
    });

    test("should match subclasses via instanceof", () => {
        const manager = new ExceptionManager();
        class BaseError extends Error {}
        class SpecificError extends BaseError {}
        const renderer = () => {};

        manager.render(BaseError, renderer);

        assert.strictEqual(manager.resolveRenderer(new SpecificError()), renderer);
    });

    test("render() should return the manager instance for chaining", () => {
        const manager = new ExceptionManager();
        const result = manager.render(Error, () => {});
        assert.strictEqual(result, manager);
    });

});

describe("ExceptionManager - report()", () => {

    test("should register and resolve a reporter independently of renderers", () => {
        const manager = new ExceptionManager();
        const reporter = () => {};

        manager.report(Error, reporter);

        assert.strictEqual(manager.resolveReporter(new Error()), reporter);
        assert.equal(manager.resolveRenderer(new Error()), null);
    });

    test("should return null if no reporter matches", () => {
        const manager = new ExceptionManager();
        assert.equal(manager.resolveReporter(new Error()), null);
    });

});
