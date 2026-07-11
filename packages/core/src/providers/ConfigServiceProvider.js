import ServiceProvider from "../ServiceProvider.js";
import ConfigManager from "../ConfigManager.js";

export default class ConfigServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("config", () => {
            return new ConfigManager();
        });
    }

    boot(app) {
        // config-specific bootstrapping agar chahiye
    }
}