import EventError from "../errors/EventError.js";

export default class EventManager {
    constructor(logger) {
        this.validateLogger(logger);
        this.logger = logger;
        this.events = new Map();
    }

    listen(event, listener) {
        this.validateEventName(event);
        this.validateListener(listener);

        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event).add(listener);
        return this;
    }

    dispatch(event, payload = {}) {
        this.validateEventName(event);

        const listeners = this.events.get(event);
        if (!listeners || listeners.size === 0) {
            return [];
        }

        const errors = [];

        for (const listener of listeners) {
            try {
                listener(payload);
            } catch (error) {
                errors.push({ event, listener, error });
                this.logger.error(`Listener for event "${event}" threw an error.`, {
                    event,
                    message: error.message,
                    stack: error.stack
                });
            }
        }

        return errors;
    }

    has(event) {
        this.validateEventName(event);
        return this.events.has(event) && this.events.get(event).size > 0;
    }

    forget(event) {
        this.validateEventName(event);
        this.events.delete(event);
        return this;
    }

    clear() {
        this.events.clear();
        return this;
    }

    validateEventName(event) {
        if (typeof event !== "string" || event.trim() === "") {
            throw new EventError("Event name must be a non-empty string.");
        }
    }

    validateListener(listener) {
        if (typeof listener !== "function") {
            throw new EventError("Listener must be a function.");
        }
    }

    validateLogger(logger) {
        if (!logger || typeof logger.error !== "function") {
            throw new EventError("EventManager requires a logger with an error() method.");
        }
    }
}