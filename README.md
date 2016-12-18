# Ashley

Ashley is a dependency injection container for JavaScript. Learn more about
[dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) or
more generally about [inversion of
control](https://en.wikipedia.org/wiki/Inversion_of_control) on Wikipedia.

- [Installation](#installation)
- [Usage](#usage)
  - [Binding instances](#binding-instances)
  - [Binding plain objects](#binding-plain-objects)
  - [Binding functions](#binding-functions)
  - [Factories](#factories)
  - [Scopes](#scopes)
  - [Container hierarchies](#container-hierarchies)
- [Integration with existing frameworks and libraries](#integration-with-existing-frameworks-and-libraries)
- [Recommendations](#recommendations)
- [FAQ](#faq)
- [License](#license)

# Installation

```bash
npm install ashley
```

Note that it makes heavy use of async functions and thus requires a fairly
recent version of Node.js (7.x or newer).

# Usage

A new instance of Ashley can be created simply by calling its
constructor. Ashley instances do not share any state and there can be
any number of them within the same application. If fact, it is
sometimes beneficial to have more than one them as they can form
hierarchies. More on that later.

```javascript
const Ashley = require('ashley');
const ashley = new Ashley();
```

Note that the code samples will use the container directly for obtaining the
configured objects. To take advantage of the dependency injection pattern in a
real application, the container should be only used explicitly during the
application's initialization process to set up the dependencies. Read more in
the [Recommendations](#recommendations) section.

## Binding instances

The most basic thing Ashley can bind is an instance of a class. A class in this
context is anything that needs to be instantiated with the `new` operator.

```javascript
ashley.instance('Logger', ConsoleLogger);
const logger = await ashley.resolve('Logger')

// the same as
const logger = new ConsoleLogger();
```

The first argument of the `instance` method is a name. This name can be used
when resolving instances or declaring dependencies. The second argument can
either be the class itself or a path to a file which defines it. Finally, the
third argument is a list of dependencies.

```javascript
ashley.instance('Logger', ConsoleLogger);
ashley.instance('OrderService', OrderService, ['Logger']);
const orderService = await ashley.resolve('OrderService')

// the same as
ashley.instance('Logger', 'src/console_logger');
ashley.instance('OrderService', 'src/order_service', ['Logger']);
const orderService = await ashley.resolve('OrderService')

// the same as
const logger = new ConsoleLogger();
const orderService = new Orderservice(logger);
```

Note that when a relative path is provided, Ashley needs to know the
root path from which the relative paths should be resolved.

```javascript
const ashley = new Ashley({
  root: __dirname
});
```

There are objects within all applications which are meant to be used
as singletons but making them actual
[singletons](https://en.wikipedia.org/wiki/Singleton_pattern) is
[problematic](https://code.google.com/archive/p/google-singleton-detector/wikis/WhySingletonsAreControversial.wiki).

An alternative is to write regular classes but let Ashley worry about their life
time (scope) once they are instantiated. Ashley provides two scopes out of the
box - `Singleton` and `Prototype`. The `Singleton` scope is used by default and
will make Ashley to always return the same instance each time it's requested.
The `Prototype` scope, on the other hand, will make Ashley to always create new
instances when requested.

```javascript
ashley.instance('DbConnection', 'src/rethink_db_connection', [], {
  scope: 'Singleton' // default
});

ashley.instance('TimePoint', 'src/time_point', [], {
  scope: 'Prototype'
});
```

For an object such as `DbConnection` to be useful, it needs to actually
establish an connection which will most likely be an asynchronous process. When
binding the object, it's possible to specify that an initialization method needs
to be called for the object to be fully ready. This is similar to a constructor
but allows the method to be asynchronous.

```javascript
ashley.instance('DbConnection', 'src/rethink_db_connection', [], {
  initialize: true
});
```

When set to `true`, Ashley will look for an async method called `initialize`
and will wait for it to finish before proceeding. It's possible to specify a
different initialize method by setting `initialize` to the name.

```javascript
class RethinkDbConnection {
  async init() {
    this.connection = await r.connect();
  }
}

ashley.instance('DbConnection', RethinkDbConnection, [], {
  initialize: 'init'
});
```

The `initialize` method should either succeed or throw an error. It's important
to make sure that time outs are set and handled as well otherwise Ashley might
wait indefinitely.

The initialization method is the same for all instances of the object. Ashley
also provides a way to set up a specific instance by defining an `setup`
function when binding the instance.

```javascript
ashley.instance('ErrorLogger', ConsoleLogger, [], {
  setup: function(logger) {
    logger.setBold(true);
    logger.setColor(ConsoleLogger.COLOR_RED);
  }
});

ashley.instance('Logger', ConsoleLogger);
```

The `setup` function will receive the instantiated object as its only
parameter. Note that the function will be called only once if the scope is set
to `Singleton` and may or may not be an async function.

There's also the option to `deinitialize` instances which works the same way
except it's invoked when the container is being shut down. It generally depends
on the scope used whether the method is supported or when it's called. The
provided `Singleton` scope will call the method only when the container is being
shutdown.

```javascript
class RethinkDbConnection {
  async initialize() {
    this.connection = await r.connect();
  }

  async deinitialize() {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

ashley.instance('DbConnection', RethinkDbConnection, [], {
  initialize: true,
  deinitialize: true
});

// ...

await ashley.shutdown();
```

Note that Ashley does NOT catch errors from these methods. It's up to the
developer to handle the failure scenarios themselves. It's especially important
for the `deinitialize` method as throwing within the method will halt
de-initialization of the remaining binds.

## Binding plain objects

Not everything needs to be wrapped in a class and sometimes it's convenient to
bind just plain objects.

```javascript
ashley.object('Config', { port: 9001 });
ashley.object('Title', 'Zoo');

const title = await ashley.resolve('Title');
```

By default the bound objects are passed by reference and thus everyone will
receive the very same object and can possibly modified it. An alternative is to
specify the `clone` option which will create a deep copy of the object each time
it's requested.

```javascript
ashley.object('FreshConfig', { port: 9001 }, {
  clone: true // uses https://lodash.com/docs/4.15.0#cloneDeep
});
```

Since some objects require special care when deep copying, it's possible to
specify the function that should be used for the purpose.

```javascript
ashley.object('Config', { port: 9001 }, {
  clone: function(obj) {
    // ...
    return copy;
  }
});
```

Note that you cannot specify the target using a file path since a string is also
a valid target in itself.

```javascript
ashley.object('Config', 'src/config');
await ashley.resolve('Config'); // => 'src/config'
```

## Binding functions

When integrating with 3rd party frameworks or libraries, it's sometimes
necessary to register callbacks which will later be invoked with a given set of
parameters. For example when using [Koa](http://koajs.com).

```javascript
const Koa = require('koa');
const app = new Koa();

const ConsoleLogger = require('src/console_logger');
const logger = new ConsoleLogger();

app.use(async function Index(ctx, next) {
  logger.info(`Serving ${ctx.request.ip}`);
  ctx.body = 'Hello world';
});

// or
app.use(require('src/index'));
```

The goal here is to invoke the callback with not only the parameters provided by
Koa (`ctx` and `next`) but also with configured dependencies, in this case an instance of
`ConsoleLogger`. It's possible to take advantage of the `function` method as
follows.

```javascript
ashley.instance('Logger', 'src/console_logger');
ashley.function('Index', 'src/index', [Ashley._, Ashley._, 'Logger']);

app.use(await ashley.resolve('Index'));
```

Defining a `function` and passing it immediately afterwards is a very common
pattern and can be shortened to just a single line. It takes advantage of the
fact that binding a target returns an async function which resolves to the
target.

```javascript
app.use(await ashley.function('Index', 'src/index', [Ashley._, Ashley._, 'Logger']));
```

Notice the use of the `Ashley._` placeholder. When present, it will be replaced
with the parameter the callback was called with by the framework. In addition,
Ashley will resolve the dependencies and pass all of it to the user defined
function.

```javascript
// src/index
module.exports = async function Index(ctx, next, logger) {
  logger.info(`Serving ${ctx.request.ip}`);
  ctx.body = 'Hello world';
}
```

It's possible to use the placeholder multiple times and in any order. If the
callback is called with fewer parameters than expected, the remaining
placeholders are passed in as `undefined`, followed by the declared
dependencies. When the number of parameters is greater than expected, only those
with a placeholder will be passed in. Note that the returned function will
always be an async function.

The Koa framework is officially supported. See [Integration with existing
frameworks and libraries](#integration-with-existing-frameworks-and-libraries)
for more information.

## Factories

Creating instances of classes or other objects is not always as straightforward
as calling its constructor, especially when using 3rd party libraries. Factories
give the option to fully control the process. Note that a factory always needs
to return a new instance.

```javascript

// src/console_logger
module.exports = function consoleLoggerFactory(config) {
  const logger = ...
  // ..
  return logger;
};

// Define the factory
ashley.factory('ConsoleLogger', 'src/console_logger_factory', ['Config']);

// Use the factory and specify other details such as the life time
ashley.link('Logger', 'ConsoleLogger', {
  scope: 'Singleton'
});

// Use the `Logger` as a dependency
ashley.instance('Service', 'src/service', ['Logger']);
```

Notice the use of the `link` method. It's used to tie the factory with a name
and gives the option to specify details such as the life time. There can be any
number of links for a particular factory.

## Scopes

Scopes define the life time of the objects they manage. As already mentioned,
Ashley provides two scopes out of the box - `Singleton` and `Prototype`. The
`Singleton` scope will make sure to always return the same instance while
`Prototype` will always create a new instance.

```javascript
ashley.instance('Logger', 'src/console_logger', [], {
  scope: 'Singleton'
});
```

It's of course possible to create custom scopes. Internally, a scope is nothing
more than a class that gets instantiated with a provider which knowns how to
create a new instance of the managed object. Later, the scope is asked for an
instance of the object and it's up the implementation to decide whether to
create a new one (e.g. `Prototype`) or always return the same (e.g.
`Singleton`).

## Container hierarchies

As applications grow, it's often desirable to split them into independent
modules each handling their own agenda and making them communicate via shared
means.

To help in this scenario, Ashley containers can form hierarchies. Each module
can have its container linked to the same parent container. When set up, each
request for an unmet dependency will bubble up the hierarchy until found.

```javascript
// core
const core = new Ashley();
ashley.instance('MessageBus', 'src/message_bus');

// module A
const moduleA = core.createChild();
moduleA.instance('ServiceA', 'src/service_a', ['MessageBus']);

// module B
const moduleB = core.createChild();
moduleB.instance('ServiceB', 'src/service_b', ['MessageBus']);
```

The way a parent container is passed to its children various from application to
application and there's no universal way. Note however that it's possible to
inject the current container as a dependency. In the following sample,
`ModuleInitializer` will receive a reference to the `ashley` variable.

```javascript
ashley.instance('ModuleInitializer', ['@containers/self']);
```

In rare cases, you can even inject the container's parent. Use with caution as
it creates often unwanted dependency between the containers.

```javascript
ashley.instance('ModuleA', ['@containers/parent']);
```

Hierarchies are also often useful for creating temporary containers. For
example, a framework might want to provide a way of having Singleton instances
but only for the duration of a web request. To do that, a child container is
created for every request with a reference to the main application's container.
This way, the main container can resolve dependencies which outlive the request
but still have the possibility to have per request dependencies such as an
object for holding the current user and others.

```javascript
// Initialized with the application
const main = new Ashley();
main.instance('Logger', 'src/console_logger');

// ...
// Created for every request and bound to the request's context
const request = main.createChild();
request.function('Index', 'src/middlewares/index', [Ashley._, Ashley._, 'Logger']);

// ...

// Shutdown the container at the end
await request.shutdown();
```

# Integration with existing frameworks and libraries

Integration with existing frameworks or libraries usually requires glue between
its components and Ashley itself. The support for these integrations goes into
separate packages prefixed with "ashley-".

The `Koa` web framework is officially supported and extracted into its own
package [ashley-koa](https://github.com/jiripospisil/ashley-koa). Head over
there for more information and usage examples.

# Recommendations

## Objects should declare all of the their dependencies

Individual objects in the system should declare all of their dependencies and
have them injected. They should not depend on or modify any global state. This
makes it easy to work with them in isolation (e.g. in unit tests).

## Objects should not depend on the container

Individual objects should not depend on the presence of the container. They
should work the same even if the container was completely removed and the
dependencies set up manually.

## Do not use or inject the container outside of an initialization phase

The container should be explicitly referenced only during an initialization
phase to set up the dependencies. As soon as the application is initialized, it
should not need the container directly anymore.

If the application is split into modules and it's necessary to pass the
container down the chain to register it as a parent, it's possible to inject it
as follows.

```javascript
ashley.instance('ModuleInitializer', ['@containers/self']);
```

## Create new instances directly or with factories

When it's necessary to create a new instance of a class and provide its
dependencies, the dependencies should be available / injected in the current
scope already. Another approach is to let the container inject a user-defined
factory which can create new instances on its own.

It's also possible to use the internally factory for the object and let the
container inject it. This is very similar to the factory pattern mentioned
before but makes the container do the work.

```javascript
ashley.instance('Item', 'src/item', ['Dependency1', 'Dependency2']);
ashley.instance('Service', 'src/service', ['@factories/Item']);

// src/item
class Item {
  constructor(dependency1, dependency2) {
    // ...
  }
}

// src/service
class Service {
  constructor(itemFactory) {
    this.itemFactory = itemFactory;
  }

  *action() {
    const item1 = await this.itemFactory.create();
    const item2 = await this.itemFactory.create();
    // ...
  }
}
```

## Use constants as names

When defining a large number of bindings, it's easy to loose track of where a
particular dependency is used. One way to alleviate the problem is to use
constants instead of string names. Most editors/IDEs will highlight usages of
these and it will also allow for precise name refactorings.

```javascript
const c = {
  Service: 'Service',
  Logger: 'Logger'
};

ashley.instance(c.Logger, 'src/console_logger');
ashley.instance(c.Service, 'src/service', [c.Logger]);
```

## Do not inject null / undefined

Some dependencies are not required in all environments or installations. The
preferred way of dealing with such scenario is to bind a dummy implementation
which offers the same interface but does not actually do anything. This way the
code doesn't have to account for the possibility of the dependency being absent
and clutter the code with conditions.

# FAQ

## Is it possible to set up dependencies using annotations?

No, there's no built in support for doing that. Additionally to the fact that
the library would then need to use a transpiler (since annotations are not yet
officially supported in the language), there are a few more reasons:

- Annotations would create a hard dependency on the container itself. Ideally
  the dependencies should not know about that fact that they're being used with
  a container.

- It would be difficult to annotate an object coming from a 3rd party library
  since these cannot / should not be modified.

- There would be no single place to see the whole dependency graph in one place.
  Instead, the graph would be spread thorough the code base making it difficult
  to make sense of it.

## Should I use Ashley for projects of any size?

No, use Ashley or other dependency injection containers only when there's
benefit. Don't use a container just for the sake of using a container. For tiny
applications, it's often overkill and setting up the dependencies manually is
preferable. Note that using dependency injection alone is beneficial for
projects of any size.

# License

ICS
