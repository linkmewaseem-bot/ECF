import ExceptionManagerError from "./errors/ExceptionManagerError.js";

export default class ExceptionManager {
    constructor() {
        this.renderers = new Map();
        this.reporters = new Map();
    }

    // ---- Public API ----

    render(ErrorClass, renderer) {
        this.validateMapping(ErrorClass, renderer, "renderer");
        this.renderers.set(ErrorClass, renderer);
        return this;
    }

    report(ErrorClass, reporter) {
        this.validateMapping(ErrorClass, reporter, "reporter");
        this.reporters.set(ErrorClass, reporter);
        return this;
    }

    resolveRenderer(error) {
        return this.resolve(error, this.renderers);
    }

    resolveReporter(error) {
        return this.resolve(error, this.reporters);
    }

    // ---- Internal ----

    resolve(error, map) {
        for (const [ErrorClass, handler] of map) {
            if (error instanceof ErrorClass) {
                return handler;
            }
        }
        return null;
    }

    // ---- Validation ----

    validateMapping(ErrorClass, handler, label) {
        if (typeof ErrorClass !== "function") {
            throw new ExceptionManagerError(`ExceptionManager: ${label} registration requires an Error class (constructor function).`);
        }
        if (typeof handler !== "function") {
            throw new ExceptionManagerError(`ExceptionManager: ${label} must be a function.`);
        }
    }
}
