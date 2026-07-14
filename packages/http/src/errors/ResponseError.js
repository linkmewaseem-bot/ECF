import ECFError from "./ECFError.js";
export default class ResponseError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ResponseError";
    }
}