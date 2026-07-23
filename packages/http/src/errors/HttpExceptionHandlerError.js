import {ECFError} from '@ecf/core';

/**
 * Error thrown when an HttpExceptionHandler-related error occurs.
 */
export default class HttpExceptionHandlerError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "HttpExceptionHandlerError";
    }
}
