import MiddlewareError from "./errors/MiddlewareError.js";

export default class Middleware {
    handle(request, response, next) {
        throw new MiddlewareError("Middleware.handle() must be implemented.");
    }
}