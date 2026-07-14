import RouteError from "./errors/RouteError.js";

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const PARAM_PATTERN = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
const SEGMENT_PATTERN = "([^/]+)";

export default class Route {
    constructor(method, path, handler) {
        this.validateMethod(method);
        this.validatePath(path);
        this.validateHandler(handler);

        this.method = method.toUpperCase();
        this.path = path;
        this.handler = this.normalizeHandler(handler);

        const compiled = this.compile(path);
        this.regex = compiled.regex;
        this.parameterNames = compiled.parameterNames;
        this.segmentCount = compiled.segmentCount;
        this.staticPrefix = compiled.staticPrefix;

        Object.freeze(this);
    }

    // ---- Compilation (runs once, at construction time) ----

    compile(path) {
        const parameterNames = [];
        const segments = path.split("/").filter(Boolean);

        const staticSegments = [];
        for (const segment of segments) {
            if (segment.startsWith("{") && segment.endsWith("}")) {
                break;
            }
            staticSegments.push(segment);
        }
        const staticPrefix = "/" + staticSegments.join("/");

        const regexBody = segments
            .map((segment) => {
                const match = segment.match(/^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/);
                if (match) {
                    parameterNames.push(match[1]);
                    return SEGMENT_PATTERN;
                }
                return this.escapeRegex(segment);
            })
            .join("/");

        const regex = new RegExp(`^/${regexBody}$`);

        return {
            regex,
            parameterNames,
            segmentCount: segments.length,
            staticPrefix
        };
    }

    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    normalizeHandler(handler) {
        if (typeof handler === "function") {
            return handler;
        }

        // [Controller, "methodName"] form
        const [ControllerClass, methodName] = handler;
        const instance = new ControllerClass();

        if (typeof instance[methodName] !== "function") {
            throw new RouteError(`Controller method "${methodName}" does not exist on ${ControllerClass.name}.`);
        }

        return instance[methodName].bind(instance);
    }

    // ---- Matching ----

    match(path) {
        const result = this.regex.exec(path);
        if (!result) {
            return null;
        }

        const params = {};
        this.parameterNames.forEach((name, index) => {
            params[name] = result[index + 1];
        });

        return params;
    }

    // ---- Validation ----

    validateMethod(method) {
        if (typeof method !== "string" || !VALID_METHODS.includes(method.toUpperCase())) {
            throw new RouteError(`Invalid HTTP method "${method}".`);
        }
    }

    validatePath(path) {
        if (typeof path !== "string" || path.trim() === "" || !path.startsWith("/")) {
            throw new RouteError(`Route path must be a non-empty string starting with "/". Got "${path}".`);
        }
    }

    validateHandler(handler) {
        const isFunction = typeof handler === "function";
        const isControllerTuple =
            Array.isArray(handler) &&
            handler.length === 2 &&
            typeof handler[0] === "function" &&
            typeof handler[1] === "string";

        if (!isFunction && !isControllerTuple) {
            throw new RouteError("Route handler must be a function or a [Controller, \"method\"] tuple.");
        }
    }
}