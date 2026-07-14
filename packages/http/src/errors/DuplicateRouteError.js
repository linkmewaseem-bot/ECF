import RouteError from "./RouteError.js";

export default class DuplicateRouteError extends RouteError {
    constructor(method, path) {
        super(`Duplicate route registration: ${method} ${path}`);
        this.name = "DuplicateRouteError";
        this.method = method;
        this.path = path;
    }
}