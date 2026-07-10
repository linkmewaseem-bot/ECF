import { describe } from "node:test";
import test from "node:test";
import assert from "node:assert/strict";
import { Container, ContainerError } from "../src/index.js";

describe("Container - make()", () => {

    test("make should throw an error for non-existent binding", () => {
        const container = new Container();
        assert.throws(() => {
            container.make("nonExistent");
        }, ContainerError);
    });

    test("make should throw an error for invalid name", () => {
        const container = new Container();
        assert.throws(() => {
            container.make("");
        }, ContainerError);

        assert.throws(() => {
            container.make(123);
        }, ContainerError);
    });

    test("make should resolve a regular (non-singleton) binding", () => {
        const container = new Container();
        container.bind("logger", () => ({ log: () => "logged" }));

        const instance = container.make("logger");
        assert.equal(typeof instance.log, "function");
        assert.equal(instance.log(), "logged");
    });

    test("make should return a NEW instance each time for non-singleton bindings", () => {
        const container = new Container();
        let counter = 0;
        container.bind("counter", () => ({ id: ++counter }));

        const first = container.make("counter");
        const second = container.make("counter");

        assert.equal(first.id, 1);
        assert.equal(second.id, 2);
        assert.notEqual(first, second);
    });

    test("make should resolve a singleton binding", () => {
        const container = new Container();
        container.singleton("config", () => ({ env: "production" }));

        const instance = container.make("config");
        assert.equal(instance.env, "production");
    });

    test("make should return the SAME instance every time for singleton bindings", () => {
        const container = new Container();
        let counter = 0;
        container.singleton("counter", () => ({ id: ++counter }));

        const first = container.make("counter");
        const second = container.make("counter");

        assert.equal(first.id, 1);
        assert.equal(second.id, 1);
        assert.strictEqual(first, second);
    });

    test("make should not share instances between different singleton bindings", () => {
        const container = new Container();
        container.singleton("a", () => ({ value: "A" }));
        container.singleton("b", () => ({ value: "B" }));

        const a = container.make("a");
        const b = container.make("b");

        assert.equal(a.value, "A");
        assert.equal(b.value, "B");
        assert.notEqual(a, b);
    });

    test("make should throw after the binding has been forgotten", () => {
        const container = new Container();
        container.bind("logger", () => ({ log: () => {} }));
        container.forget("logger");

        assert.throws(() => {
            container.make("logger");
        }, ContainerError);
    });

    test("make should throw after flush()", () => {
        const container = new Container();
        container.singleton("config", () => ({ env: "dev" }));
        container.flush();

        assert.throws(() => {
            container.make("config");
        }, ContainerError);
    });

    test("ECF", () => {
        const container = new Container();
        container.bind("config", () => {
    return { app: "ECF" };
});

container.bind("service", (container) => {
    return {
        config: container.make("config")
    };
});

const service = container.make("service");

console.log(service.config.app);
    })

    test("should detect circular dependency", () => {

    const container = new Container();

    container.bind("A", (container) => {
        return {
            b: container.make("B")
        };
    });

    container.bind("B", (container) => {
        return {
            a: container.make("A")
        };
    });

    assert.throws(() => {
        container.make("A");
    });

});

});