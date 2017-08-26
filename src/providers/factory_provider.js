'use strict';

class FactoryProvider {
  constructor(bindName, container, fn, dependencies) {
    this.bindName = bindName;
    this.container = container;
    this.fn = fn;
    this.dependencies = dependencies;
  }

  async create() {
    const dependencies = await this.container.resolveAll(this.dependencies);
    return this.fn(...dependencies);
  }
}

module.exports = FactoryProvider;
