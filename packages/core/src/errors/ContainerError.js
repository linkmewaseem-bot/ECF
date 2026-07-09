import ECFError from "./ECFError.js";

export default class ContainerError extends ECFError {
    constructor(message) {
        super(message);
        this.name = "ContainerError";
    }
}