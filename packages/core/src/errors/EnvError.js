import ECFError from './ECFError.js'
export default class EnvError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "EnvError";
    }
}