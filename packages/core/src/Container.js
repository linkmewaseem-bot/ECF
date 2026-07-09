import ContainerError from "./errors/ContainerError.js";
import Binding from "./Binding.js";
import Resolver from "./Resolver.js";
export default class Container {
    constructor() {

        this.bindings = new Map();
        this.instances = new Map();
        this.resolver = new Resolver();
    }
    bind(name, factory){
        this.validateBinding(name, factory);
        const binding = new Binding(factory, false);
        this.bindings.set(name, binding);
    }

    singleton(name, factory){
        this.validateBinding(name, factory);
        const binding = new Binding(factory, true);
        this.bindings.set(name, binding);
    }
    has(name){
        this.validateName(name);
        return this.bindings.has(name);
    }

    make(name){
        this.validateName(name);
        if (!this.bindings.has(name)) {
            throw new ContainerError(`Binding with name "${name}" does not exist.`);
        }
        const binding = this.bindings.get(name);
        if (binding.singleton) {
            if (!this.instances.has(name)) {
                this.instances.set(name, binding.factory());
            }
            return this.instances.get(name);
        }
        return this.resolver.resolve(binding);
    }

    forget(name){
        this.validateName(name);
        if (!this.bindings.has(name)) {
            throw new ContainerError(`Binding with name "${name}" does not exist.`);
        }
        this.bindings.delete(name);
        this.instances.delete(name);
    }

    flush(){
        this.bindings.clear();
        this.instances.clear();
    }

    validateName(name) {
        if (typeof name !== "string" || name.trim() === "") {
            throw new ContainerError("Binding name must be a non-empty string.");
        }
    }

    validateBinding(name, factory){
        this.validateName(name);
        if(typeof factory !== "function"){
            throw new ContainerError(`Factory for binding "${name}" must be a function.`);
        }
    }
    }

