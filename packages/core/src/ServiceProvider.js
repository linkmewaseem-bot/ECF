
export default class ServiceProvider {
    register(app) {
        // Override in subclass to register services with the application container
    }
    boot(app) {
        // Override in subclass to perform bootstrapping tasks after all providers are registered
    }
}