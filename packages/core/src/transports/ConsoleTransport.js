import Transport from "./Transport.js";

export default class ConsoleTransport extends Transport {
    log(level, message, context = {}) {
        const formatted = this.format(level, message, context);

        switch (level) {
            case "warning":
                console.warn(formatted);
                break;
            case "error":
            case "critical":
                console.error(formatted);
                break;
            case "info":
            default:
                console.info(formatted);
                break;
        }
    }

    format(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length ? JSON.stringify(context) : "";
        return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`.trim();
    }
}