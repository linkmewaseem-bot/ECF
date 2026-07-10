export default class Binding {

    constructor(
        factory, 
        singleton = false,
        BindingType = "factory"
    ) {
        this.factory = factory;
        this.singleton = singleton;
        this.BindingType = BindingType;
    }

    

}