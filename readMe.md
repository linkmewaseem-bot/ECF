# ECF

ECF is a lightweight dependency injection and service container framework for JavaScript and Node.js applications. The repository is built as a pnpm workspace and currently focuses on the `@ecf/core` package.

## What is included

The core package provides:

- `Container` for binding factories and resolving services
- `singleton` support with instance caching
- `Application` wrapper for provider-based bootstrapping
- `ServiceProvider` base class for organized registration and boot logic
- container validation and circular dependency detection
- `ContainerError` and `ECFError` for framework-specific errors

## Package structure

- `packages/core/src` — core implementation
- `packages/core/tests` — unit tests for core behavior
- `docs` — project documentation
- `apps`, `packages`, `tools` — workspace areas for future expansion

## Supported environment

- Node.js `>=22`
- ECMAScript module format (`type: module`)
- pnpm workspace package management

## Installation

```bash
pnpm install
```

## Running tests

From the repository root:

```bash
pnpm test
```

## Core package usage

Import the core package from `@ecf/core`:

```js
import { Application, ServiceProvider } from "@ecf/core";

class DatabaseProvider extends ServiceProvider {
  register(app) {
    app.singleton("database", () => ({ connected: true }));
  }
}

const app = new Application();
app.register(DatabaseProvider);
app.boot();

const db = app.make("database");
console.log(db.connected); // true
```

### Container example

```js
import { Container } from "@ecf/core";

const container = new Container();
container.bind("logger", () => ({ log: (message) => console.log(message) }));
const logger = container.make("logger");
logger.log("Hello ECF");
```

### Singleton example

```js
import { Container } from "@ecf/core";

const container = new Container();
container.singleton("config", () => ({ env: "production" }));
const configA = container.make("config");
const configB = container.make("config");
console.log(configA === configB); // true
```

## Exported API from `@ecf/core`

- `Container`
- `Application`
- `ServiceProvider`
- `ContainerError`
- `ECFError`
- `ConfigManager`
- `ConfigError`

## Documentation

See [docs/ecf-framework.md](docs/ecf-framework.md) for a more detailed framework overview.

## Current status

The core module is complete for the current container and provider features. It provides a solid foundation for dependency injection and service provider bootstrapping, with room to expand into config, logging, event, and environment helpers.

## Roadmap

Phase 1 (Completed) ✅

- Container
- Application
- Service Providers
- Config
- Logger
- Environment
- Event
- Facades

Phase 2 (HTTP Core)

1. Request
2. Response
3. Router
4. Route
5. Middleware Pipeline
6. HTTP Kernel

Phase 3

- Controller
- View Engine (.ecf)
- Validation
- Session
- Cookies
- CSRF

Phase 4

- Database
- Query Builder
- ORM
- Migration
- Seeder

Phase 5

- CLI
- Queue
- Cache
- Scheduler
- Mail
