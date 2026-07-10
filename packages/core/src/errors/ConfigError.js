import ECFError from './ECFError.js';

/**
 * Error thrown when there is a configuration issue.
 */
export default class ConfigError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ConfigError";
    }
}