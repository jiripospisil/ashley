'use strict';

const utils = require('../utils');

class FactoryProvider {
  constructor(bindName, container, fn, dependencies) {
    this.bindName = bindName;
    this.container = container;
    this.fn = fn;
    this.dependencies = dependencies;
  }

  *create() {
    const dependencies = yield this.container.resolveAll(this.dependencies);

    if (utils.isGeneratorFunction(this.fn)) {
      return yield this.fn(...dependencies);
    }

    return this.fn(...dependencies);
  }
}

module.exports = FactoryProvider;
