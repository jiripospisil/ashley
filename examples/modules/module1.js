'use strict';

class Module1 {
  constructor(logger, container) {
    this.logger = logger;
    this.container = container.createChild();

    // Initialize individual components of this module. As this is another
    // composition root, it's okay to use the container here directly.
    this.container.instance('Info', './module1/info', ['Logger', 'RequestCounter'], {
      initialize: true,
      deinitialize: true
    });
    this.container.resolve('Info');
  }

  deinitialize() {
    this.logger('Module1: Deinitializing components...');
    return this.container.shutdown();
  }
}

module.exports = Module1;

