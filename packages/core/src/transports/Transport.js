export default class Transport {
    log(level, message, context = {}) {
        throw new Error("Transport must implement log().");
    }
}