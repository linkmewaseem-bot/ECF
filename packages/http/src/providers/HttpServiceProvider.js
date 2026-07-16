import { ServiceProvider } from "@ecf/core";
import Router from "../Router.js";
import HttpKernel from "../HttpKernel.js";
import HttpServer from "../HttpServer.js";
import MiddlewareRegistry from "../MiddlewareRegistry.js";
import MiddlewareResolver from "../MiddlewareResolver.js";

// Temporary placeholder until BodyParserManager is built (Phase 2).
const noopBodyParserManager = {
    parse: async () => ({})
};

export default class HttpServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("router", () => {
            return new Router();
        });

        app.singleton("middleware.registry", () => {
            return new MiddlewareRegistry();
        });

        app.singleton("middleware.resolver", () => {
            const registry = app.make("middleware.registry");
            return new MiddlewareResolver(registry);
        });

        app.singleton("http.kernel", () => {
            const router = app.make("router");
            const resolver = app.make("middleware.resolver");
            return new HttpKernel(router, noopBodyParserManager, resolver);
        });

        app.singleton("http.server", () => {
            const kernel = app.make("http.kernel");
            return new HttpServer(kernel);
        });
    }

    boot(app) {
        // future: route file auto-loading, group prefixes, etc.
    }
}