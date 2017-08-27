'use strict';

class Module2 {
  constructor(logger, container) {
    this.logger = logger;
    this.container = container.createChild();

    this.logger('Module2: Constructor');

    // Initialize individual components of this module. As this is another
    // composition root, it's okay to use the container here directly.
    this.container.instance('Server', './module2/server',
      ['Config', 'Logger', 'DatabaseConnection', 'RequestCounter'], {
        initialize: true,
        deinitialize: true,
        scope: 'Prototype'
      });

    // The scope of the server is Prototype, this will therefore create two
    // separate instances of the Server class. Notice that both of the servers
    // require a database connection but since the database connection has a
    // Singleton scope, they will both get the same one.
    this.container.resolve('Server');
    this.container.resolve('Server');
  }

  deinitialize() {
    this.logger('Module2: Deinitializing components...');
    return this.container.shutdown();
  }
}

module.exports = Module2;
