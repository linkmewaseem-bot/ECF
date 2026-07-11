// facades/Config.js

import Facade from "../Facade.js";

class Config extends Facade {
    static accessor() {
        return "config";
    }
}

const ConfigFacade = Facade.create(Config);

export default ConfigFacade;