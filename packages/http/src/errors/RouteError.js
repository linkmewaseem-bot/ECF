import ECFError from './ECFError.js';

/**
 * Error thrown when a route-related error occurs.
 */
export default class RouteError extends ECFError {
    constructor(message) {
        super(message);
         this.name = "RouteError";
    }
}