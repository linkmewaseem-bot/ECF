import RouteError from "./RouteError.js";

export default class RouteNotFoundError extends RouteError {
    constructor(method, path) {
        super(`No route found for ${method} ${path}`);
        this.name = "RouteNotFoundError";
        this.method = method;
        this.path = path;
    }
}