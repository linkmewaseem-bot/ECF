import {Container,ContainerError,ServiceProvider} from "./index.js";


export default class Application {
    constructor() {
        this.container = new Container();
        this.providers = new Set();
    }

    // ---- Container delegation ----
    bind(...args) {
        return this.container.bind(...args);
    }

    singleton(...args) {
        return this.container.singleton(...args);
    }

    make(...args) {
        return this.container.make(...args);
    }

    has(...args) {
        return this.container.has(...args);
    }

    forget(...args) {
        return this.container.forget(...args);
    }

    flush(...args) {
        return this.container.flush(...args);
    }

    // ---- Provider handling ----
    register(ProviderClass) {
        this.validateProvider(ProviderClass);

        if (this.providers.has(ProviderClass)) {
            return this; // already registered, skip
        }

        this.providers.add(ProviderClass);
        return this;
    }

    boot() {
        for (const ProviderClass of this.providers) {
            const provider = new ProviderClass();
            provider.register(this);
            provider.boot(this);
        }
        return this;
    }

    validateProvider(ProviderClass) {
        if (typeof ProviderClass !== "function") {
            throw new ContainerError("Service provider must be a class.");
        }

        if (!(ProviderClass.prototype instanceof ServiceProvider)) {
            throw new ContainerError(
                `Service provider "${ProviderClass.name}" must extend ServiceProvider.`
            );
        }
    }
}