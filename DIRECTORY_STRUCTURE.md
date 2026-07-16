# ECF — Directory Structure

```
ecf/                                          📁 Root
├── .editorconfig                             📄 File
├── .gitignore                                📄 File
├── diagram.md                                📄 File
├── package.json                              📄 File
├── pnpm-lock.yaml                            📄 File
├── pnpm-workspace.yaml                       📄 File
├── readMe.md                                 📄 File
│
├── apps/                                     📁 Folder (empty)
│
├── docs/                                     📁 Folder
│   └── ecf-framework.md                      📄 File
│
├── tools/                                    📁 Folder (empty)
│
└── packages/                                 📁 Folder
    │
    ├── commerce/                             📁 Folder (empty)
    │
    ├── view/                                 📁 Folder (empty)
    │
    ├── core/                                 📁 Folder
    │   ├── package.json                      📄 File
    │   │
    │   ├── src/                              📁 Folder
    │   │   ├── Application.js                📄 File
    │   │   ├── Binding.js                    📄 File
    │   │   ├── ConfigManager.js              📄 File
    │   │   ├── Container.js                  📄 File
    │   │   ├── Facade.js                     📄 File
    │   │   ├── LoggerManager.js              📄 File
    │   │   ├── Resolver.js                   📄 File
    │   │   ├── ServiceProvider.js            📄 File
    │   │   ├── index.js                      📄 File
    │   │   │
    │   │   ├── env/                          📁 Folder
    │   │   │   ├── DotEnvLoader.js           📄 File
    │   │   │   └── EnvManager.js             📄 File
    │   │   │
    │   │   ├── errors/                       📁 Folder
    │   │   │   ├── ConfigError.js            📄 File
    │   │   │   ├── ContainerError.js         📄 File
    │   │   │   ├── ECFError.js               📄 File
    │   │   │   ├── EnvError.js               📄 File
    │   │   │   ├── EventError.js             📄 File
    │   │   │   └── LoggerError.js            📄 File
    │   │   │
    │   │   ├── events/                       📁 Folder
    │   │   │   └── EventManager.js           📄 File
    │   │   │
    │   │   ├── facade/                       📁 Folder
    │   │   │   ├── Config.js                 📄 File
    │   │   │   ├── DB.js                     📄 File
    │   │   │   ├── Env.js                    📄 File
    │   │   │   ├── Event.js                  📄 File
    │   │   │   └── Log.js                    📄 File
    │   │   │
    │   │   ├── providers/                    📁 Folder
    │   │   │   ├── ConfigServiceProvider.js          📄 File
    │   │   │   ├── DatabaseServiceProvider.js        📄 File
    │   │   │   ├── EnvironmentServiceProvider.js     📄 File
    │   │   │   ├── EventServiceProvider.js           📄 File
    │   │   │   └── LoggerServiceProvider.js          📄 File
    │   │   │
    │   │   └── transports/                   📁 Folder
    │   │       ├── ConsoleTransport.js       📄 File
    │   │       └── Transport.js              📄 File
    │   │
    │   └── tests/                            📁 Folder
    │       ├── Application.test.js           📄 File
    │       ├── Config.test.js                📄 File
    │       ├── Container.test.js             📄 File
    │       ├── DotEnvLoader.test.js          📄 File
    │       ├── EnvManager.test.js            📄 File
    │       ├── EnvironmentServiceProvider.test.js    📄 File
    │       ├── EventManager.test.js          📄 File
    │       ├── EventServiceProvider.test.js  📄 File
    │       ├── Facade.test.js                📄 File
    │       ├── Logger.test.js                📄 File
    │       └── fixtures/                     📁 Folder (empty)
    │
    └── http/                                 📁 Folder
        ├── package.json                      📄 File
        │
        ├── src/                              📁 Folder
        │   ├── AttributeBag.js               📄 File
        │   ├── HttpKernel.js                 📄 File
        │   ├── HttpServer.js                 📄 File
        │   ├── Pipeline.js                   📄 File
        │   ├── Request.js                    📄 File
        │   ├── Response.js                   📄 File
        │   ├── Route.js                      📄 File
        │   ├── Router.js                     📄 File
        │   ├── index.js                      📄 File
        │   │
        │   ├── errors/                       📁 Folder
        │   │   ├── DuplicateRouteError.js    📄 File
        │   │   ├── HttpKernelError.js        📄 File
        │   │   ├── HttpServerError.js        📄 File
        │   │   ├── PipelineError.js          📄 File
        │   │   ├── RequestError.js           📄 File
        │   │   ├── ResponseError.js          📄 File
        │   │   ├── RouteError.js             📄 File
        │   │   ├── RouteNotFoundError.js     📄 File
        │   │   └── RouterError.js            📄 File
        │   │
        │   ├── facades/                      📁 Folder
        │   │   └── Route.js                  📄 File
        │   │
        │   ├── middleware/                   📁 Folder (empty)
        │   │
        │   ├── parsers/                      📁 Folder (empty)
        │   │
        │   ├── providers/                    📁 Folder
        │   │   └── HttpServiceProvider.js    📄 File
        │   │
        │   └── routing/                      📁 Folder (empty)
        │
        └── tests/                            📁 Folder
            ├── HttpKernel.test.js            📄 File
            ├── HttpServer.test.js            📄 File
            ├── HttpServiceProvider.test.js   📄 File
            ├── Pipeline.test.js              📄 File
            ├── Request.test.js               📄 File
            ├── Response.test.js              📄 File
            ├── Route.test.js                 📄 File
            └── Router.test.js                📄 File
```

## Summary

| Type      | Count |
|-----------|-------|
| 📁 Folders | 30    |
| 📄 Files   | 72    |

> **Note:** `.git/` and `node_modules/` directories are excluded from this tree.
