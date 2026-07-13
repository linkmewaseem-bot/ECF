import ServiceProvider from "../ServiceProvider.js";
import LoggerManager from "../LoggerManager.js";
import ConsoleTransport from "../transports/ConsoleTransport.js";

export default class LoggerServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("logger", () => {
            const manager = new LoggerManager();
            manager.addTransport(new ConsoleTransport());
            return manager;
        });
    }

    boot(app) {
        // future: file/slack transports config se load ho sakte hain
    }
}