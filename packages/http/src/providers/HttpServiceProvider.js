import { ServiceProvider } from "@ecf/core";
import Router from "../Router.js";
import HttpKernel from "../HttpKernel.js";
import HttpServer from "../HttpServer.js";
import MiddlewareRegistry from "../middleware/MiddlewareRegistry.js";
import MiddlewareResolver from "../middleware/MiddlewareResolver.js";

const noopBodyParserManager = {
    parse: async () => ({})
};

export default class HttpServiceProvider extends ServiceProvider {
    register(app) {
        app.singleton("middleware.registry", () => {
            return new MiddlewareRegistry();
        });

        app.singleton("router", () => {
            return new Router();
        });

        app.singleton("middleware.resolver", () => {
            const router = app.make("router");
            const registry = app.make("middleware.registry");
            return new MiddlewareResolver(router, registry);
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
        app.registerListenHandler((app, args) => {
            const server = app.make("http.server");
            server.listen(...args);
        });
    }
}