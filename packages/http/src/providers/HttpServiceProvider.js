import {ServiceProvider} from "@ecf/core"; 
import Router from "../Router.js";

export default class HttpServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("router", () => {
            return new Router();
        });
    }

    boot(app) {
        // future: route file auto-loading, group prefixes, etc.
    }
}