import LoggerError from "./errors/LoggerError.js";

export default class LoggerManager {
    constructor() {
        this.transports = new Set();
    }

    addTransport(transport) {
        this.#validateTransport(transport);
        this.transports.add(transport);
        return this;
    }

    removeTransport(transport) {
        this.transports.delete(transport);
        return this;
    }

    log(level, message, context = {}) {
        for (const transport of this.transports) {
            transport.log(level, message, context);
        }
        return this;
    }

    info(message, context = {}) {
        return this.log("info", message, context);
    }

    warning(message, context = {}) {
        return this.log("warning", message, context);
    }

    error(message, context = {}) {
        return this.log("error", message, context);
    }

    critical(message, context = {}) {
        return this.log("critical", message, context);
    }

    #validateTransport(transport) {
        if (!transport || typeof transport.log !== "function") {
            throw new LoggerError(
                "Transport must be an object implementing a log(level, message, context) method."
            );
        }
    }
}