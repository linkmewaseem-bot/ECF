import ServiceProvider from "../ServiceProvider.js";
import EnvManager from "../env/EnvManager.js";
import DotEnvLoader from "../env/DotEnvLoader.js";
import path from "node:path";
import fs from "node:fs";

export default class EnvironmentServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("env", () => {
            const manager = new EnvManager();
            const loader = new DotEnvLoader();

            const envPath = path.join(process.cwd(), ".env");

            if (fs.existsSync(envPath)) {
                const parsed = loader.load(envPath);
                this.hydrate(manager, parsed);
            }

            return manager;
        });
    }

    boot(app) {
        // future: .env.local, .env.production wagera yahan merge ho sakte hain
    }

    hydrate(manager, parsed) {
        for (const [key, value] of Object.entries(parsed)) {
            manager.set(key, value);

            // process.env mein sirf tab daalo agar already set nahi hai
            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    }
}