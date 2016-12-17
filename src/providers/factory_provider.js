'use strict';

const utils = require('../utils');

class FactoryProvider {
  constructor(bindName, container, fn, dependencies) {
    this.bindName = bindName;
    this.container = container;
    this.fn = fn;
    this.dependencies = dependencies;
  }

  async create() {
    const dependencies = await this.container.resolveAll(this.dependencies);

    if (utils.isAsyncFunction(this.fn)) {
      return await this.fn(...dependencies);
    }

    return this.fn(...dependencies);
  }
}

module.exports = FactoryProvider;
