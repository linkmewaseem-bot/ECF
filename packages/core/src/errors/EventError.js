import ECFError from "./ECFError.js";
export default class EventError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "EventError";
    }
}