import ECFError from './ECFError.js'
export default class LoggerError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "LoggerError";
    }
}