export default class Binding {

    constructor(factory, singleton = false) {
        this.factory = factory;
        this.singleton = singleton;
    }

    

}