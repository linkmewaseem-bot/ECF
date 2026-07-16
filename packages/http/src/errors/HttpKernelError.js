import {ECFError} from '@ecf/core';

/**
 * Error thrown when an HTTP kernel-related error occurs.
 */
export default class HttpKernelError extends ECFError {
    constructor(message) {
        super(message);
         this.name = "HttpKernelError";
    }
}
