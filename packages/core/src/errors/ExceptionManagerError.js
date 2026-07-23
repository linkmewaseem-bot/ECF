import ECFError from "./ECFError.js";

/**
 * Error thrown when an ExceptionManager-related error occurs.
 */
export default class ExceptionManagerError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ExceptionManagerError";
    }
}
