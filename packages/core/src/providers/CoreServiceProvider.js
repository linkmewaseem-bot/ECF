import ServiceProvider from "../ServiceProvider.js";
import ExceptionManager from "../ExceptionManager.js";

export default class CoreServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("exception.manager", () => {
            return new ExceptionManager();
        });
    }

    boot(app) {}
}
