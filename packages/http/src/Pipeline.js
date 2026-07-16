import PipelineError from "./errors/PipelineError.js";
import Request from "./Request.js";
import Response from "./Response.js";

export default class Pipeline {
    constructor() {
        this.request = null;
        this.response = null;
        this.middlewares = [];
    }

    // ---- Public API ----

    send(request, response) {
        this.validateRequest(request);
        this.validateResponse(response);

        this.request = request;
        this.response = response;
        return this;
    }

    through(middlewares) {
        this.validateMiddlewares(middlewares);

        this.middlewares = [...middlewares];
        return this;
    }

    then(destination) {
        this.validateDestination(destination);
        this.assertReady();

        return this.execute(destination);
    }

    // ---- Execution engine ----

    execute(destination) {
        const chain = this.buildChain(destination);
        return chain();
    }

    buildChain(destination) {
        // Reduce right: wrap each middleware around the next one,
        // starting from the destination as the innermost function.
        return this.middlewares.reduceRight((next, middleware) => {
            return () => middleware(this.request, this.response, next);
        }, () => destination(this.request, this.response));
    }

    // ---- Validation ----

    validateRequest(request) {
        if (!request || !(request instanceof Request)) {
            throw new PipelineError("Pipeline requires a valid Request instance.");
        }
    }

    validateResponse(response) {
        if (!response || !(response instanceof Response)) {
            throw new PipelineError("Pipeline requires a valid Response instance.");
        }
    }

    validateMiddlewares(middlewares) {
        if (!Array.isArray(middlewares)) {
            throw new PipelineError("Pipeline requires an array of middleware functions.");
        }

        for (let i = 0; i < middlewares.length; i++) {
            if (typeof middlewares[i] !== "function") {
                throw new PipelineError(`Middleware at index ${i} must be a function.`);
            }
        }
    }

    validateDestination(destination) {
        if (typeof destination !== "function") {
            throw new PipelineError("Pipeline requires a valid destination function.");
        }
    }

    assertReady() {
        if (!this.request || !this.response) {
            throw new PipelineError("Pipeline requires send() to be called with request and response before then().");
        }
    }
}