import Facade from "../Facade.js";

class Env extends Facade {
    static accessor() {
        return "env";
    }
}

export default Facade.create(Env);