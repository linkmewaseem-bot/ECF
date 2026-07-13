import Facade from "../Facade.js";

 class Log extends Facade {
    static accessor() {
        return "logger";
    }
}

export default Facade.create(Log);