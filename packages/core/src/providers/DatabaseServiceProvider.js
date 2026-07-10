import ServiceProvider from "../ServiceProvider.js";
class Database {
    constructor() {
        this.connected = false;
    }
}
export default class DatabaseServiceProvider extends ServiceProvider {
    register(app) {
        // Register the database service with the application container
        app.singleton("database", () => new Database());
    }
    boot(app) {
        // Perform any bootstrapping tasks for the database service
    }
}