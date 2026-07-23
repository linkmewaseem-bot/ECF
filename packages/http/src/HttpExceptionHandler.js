import HttpExceptionHandlerError from "./errors/HttpExceptionHandlerError.js";

export default class HttpExceptionHandler {
    constructor(exceptionManager) {
        this.validateExceptionManager(exceptionManager);
        this.manager = exceptionManager;
    }

    // ---- Public API ----

    handle(error, request, response) {
        this.reportIfRegistered(error);

        const renderer = this.manager.resolveRenderer(error);

        if (renderer) {
            return renderer(error, request, response);
        }

        return this.fallback(error, request, response);
    }

    // ---- Internal ----

    reportIfRegistered(error) {
        const reporter = this.manager.resolveReporter(error);
        if (reporter) {
            reporter(error);
        }
    }

    fallback(error, request, response) {
        return response.status(500).text("Internal Server Error");
    }

    // ---- Validation ----

    validateExceptionManager(manager) {
        if (
            !manager ||
            typeof manager.resolveRenderer !== "function" ||
            typeof manager.resolveReporter !== "function"
        ) {
            throw new HttpExceptionHandlerError("HttpExceptionHandler requires an ExceptionManager with resolveRenderer() and resolveReporter() methods.");
        }
    }
}
