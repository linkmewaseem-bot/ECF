import ContainerError from "./errors/ContainerError.js";
import Binding from "./Binding.js";
import Resolver from "./Resolver.js";

export default class Container {
    constructor() {
        this.bindings = new Map();
        this.instances = new Map();
        this.resolver = new Resolver();
        this.resolving = new Set();
    }

    bind(name, factory) {
        this.validateBinding(name, factory);
        const binding = new Binding(factory, false);
        this.bindings.set(name, binding);
    }

    singleton(name, factory) {
        this.validateBinding(name, factory);
        const binding = new Binding(factory, true);
        this.bindings.set(name, binding);
    }

    has(name) {
        this.validateName(name);
        return this.bindings.has(name);
    }

    make(name) {
        this.validateName(name);

        if (!this.bindings.has(name)) {
            throw new ContainerError(`Binding with name "${name}" does not exist.`);
        }


        if (this.resolving.has(name)) {
            const chain = Array.from(this.resolving);
            chain.push(name);
            throw new ContainerError(
                `Circular dependency detected: ${chain.join(" -> ")}`
            );
        }

        const binding = this.bindings.get(name);



        if (binding.singleton) {
            if (!this.instances.has(name)) {
                this.resolving.add(name);
                try {
                    const instance = this.resolver.resolve(binding, this);  // container ab pass hota hai
                    this.instances.set(name, instance);
                } finally {
                    this.resolving.delete(name);
                }
            }
            return this.instances.get(name);
        }


        this.resolving.add(name);
        try {

            return this.resolver.resolve(binding, this);
        } finally {
            this.resolving.delete(name);
        }
    }

    forget(name) {
        this.validateName(name);
        if (!this.bindings.has(name)) {
            throw new ContainerError(`Binding with name "${name}" does not exist.`);
        }
        this.bindings.delete(name);
        this.instances.delete(name);
    }

    flush() {
        this.bindings.clear();
        this.instances.clear();
        this.resolving.clear();
    }

    validateName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ContainerError("Binding name must be a non-empty string.");
        }
    }

    validateBinding(name, factory) {
        this.validateName(name);
        if (typeof factory !== "function") {
            throw new ContainerError(`Factory for binding "${name}" must be a function.`);
        }
    }
}