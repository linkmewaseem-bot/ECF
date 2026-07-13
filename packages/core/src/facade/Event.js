import Facade from "../Facade.js";

class Event extends Facade {
    static accessor() {
        return "event";
    }
}

export default Facade.create(Event);