import ServiceProvider from "../ServiceProvider.js";
import EventManager from "../events/EventManager.js";

export default class EventServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("event", () => {
            const logger = app.make("logger"); // container se resolve, facade se nahi
            return new EventManager(logger);
        });
    }

    boot(app) {
        // future: config se auto-discovered listeners yahan register ho sakte hain
    }
}