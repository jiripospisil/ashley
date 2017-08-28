# Examples

You need a recent version of Node.js with async/await support (7.x or newer).
Depending on the version, you *might* need to pass the `--harmony-async-await`
flag.

```bash
node --harmony-async-await basic.js
```

- Basic: Demonstrates basic usage of Ashley. Sets up a few dependencies and
  resolves the graph.
- Factories: Demonstrates usage of factories and scopes.
- Variants: Demonstrates how the `setup` function can be used to further
  customize individual instances.
- Dependency cycle: Demonstrates Ashley's handling of dependency cycles.
- Modules: Demonstrates a more complex architecture where the application is
  divided into modules. Each module represents a part of the application and is
  completely independent with the option to seamlessly reference dependencies
  defined in the parent container.
