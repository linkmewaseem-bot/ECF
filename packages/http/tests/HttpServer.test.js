import { describe, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import HttpServer from "../src/HttpServer.js";
import HttpServerError from "../src/errors/HttpServerError.js";

function makeFakeKernel(handleFn = () => {}) {
    return { handle: handleFn };
}

describe("HttpServer - constructor", () => {

    test("should accept a valid kernel", () => {
        assert.doesNotThrow(() => new HttpServer(makeFakeKernel()));
    });

    test("should throw HttpServerError if kernel is null", () => {
        assert.throws(() => new HttpServer(null), HttpServerError);
    });

    test("should throw HttpServerError if kernel has no handle() method", () => {
        assert.throws(() => new HttpServer({}), HttpServerError);
        assert.throws(() => new HttpServer({ handle: "not-a-function" }), HttpServerError);
    });

});

describe("HttpServer - listen()", () => {

   test("should return the HttpServer instance for chaining", async () => {
    const server = new HttpServer(makeFakeKernel());
    let result;

    await new Promise((resolve) => {
        result = server.listen(0, resolve);
    });

    assert.strictEqual(result, server);
    await new Promise((resolve) => server.close(resolve));
});

    test("should start listening and accept a callback", async () => {
        const server = new HttpServer(makeFakeKernel());

        await new Promise((resolve) => {
            server.listen(0, resolve);
        });

        assert.equal(server.listening, true);
        await new Promise((resolve) => server.close(resolve));
    });

    test("should accept a host argument", async () => {
        const server = new HttpServer(makeFakeKernel());

        await new Promise((resolve) => {
            server.listen(0, "127.0.0.1", resolve);
        });

        await new Promise((resolve) => server.close(resolve));
    });

    test("should throw HttpServerError for an invalid port", () => {
        const server = new HttpServer(makeFakeKernel());

        assert.throws(() => server.listen(-1), HttpServerError);
        assert.throws(() => server.listen(70000), HttpServerError);
        assert.throws(() => server.listen("3000"), HttpServerError);
        assert.throws(() => server.listen(3.5), HttpServerError);
    });

    test("should throw HttpServerError for an invalid host", () => {
        const server = new HttpServer(makeFakeKernel());
        assert.throws(() => server.listen(0, 123), HttpServerError);
    });

//     test("should throw HttpServerError for an invalid callback", () => {
//     const server = new HttpServer(makeFakeKernel());

//     // 2-arg form: agar 2nd position function-like intent hai lekin function nahi
//     assert.throws(() => server.listen(0, 123), HttpServerError); // already covered by "invalid host" test, number is neither valid host nor function

//     // 3-arg form: host string diya, 3rd position callback honi chahiye
//     assert.throws(() => server.listen(0, "127.0.0.1", "not-a-function"), HttpServerError);
// });
test("should throw HttpServerError for an invalid callback in 3-arg form", () => {
    const server = new HttpServer(makeFakeKernel());
    assert.throws(() => server.listen(0, "127.0.0.1", "not-a-function"), HttpServerError);
});
    test("should throw HttpServerError if listen() is called while already listening", async () => {
        const server = new HttpServer(makeFakeKernel());
        await new Promise((resolve) => server.listen(0, resolve));

        assert.throws(() => server.listen(0), HttpServerError);

        await new Promise((resolve) => server.close(resolve));
    });

    test("should delegate incoming requests to kernel.handle()", async () => {
        let called = false;

        const kernel = makeFakeKernel((req, res) => {
            called = true;
            res.statusCode = 200;
            res.end("ok");
        });

        const server = new HttpServer(kernel);

        await new Promise((resolve) => server.listen(0, resolve));
        const address = server.address();

        await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${address.port}`, (res) => {
                res.on("data", () => {});
                res.on("end", resolve);
            }).on("error", reject);
        });

        await new Promise((resolve) => server.close(resolve));

        assert.equal(called, true);
    });

});

describe("HttpServer - close()", () => {

    test("should return the HttpServer instance for chaining", async () => {
        const server = new HttpServer(makeFakeKernel());
        await new Promise((resolve) => server.listen(0, resolve));

        const result = server.close(() => {});
        assert.strictEqual(result, server);

        await new Promise((resolve) => setTimeout(resolve, 10));
    });

    test("should execute the callback on close", async () => {
        const server = new HttpServer(makeFakeKernel());
        await new Promise((resolve) => server.listen(0, resolve));

        await new Promise((resolve) => {
            server.close(resolve);
        });

        assert.equal(server.listening, false);
    });

    test("should throw HttpServerError if callback is not a function", async () => {
        const server = new HttpServer(makeFakeKernel());
        await new Promise((resolve) => server.listen(0, resolve));

        assert.throws(() => server.close("not-a-function"), HttpServerError);

        await new Promise((resolve) => server.close(resolve));
    });

    test("should throw HttpServerError if close() is called before listen()", () => {
        const server = new HttpServer(makeFakeKernel());
        assert.throws(() => server.close(), HttpServerError);
    });

});