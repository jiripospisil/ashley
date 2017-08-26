'use strict';

const utils = require('../utils');

class FunctionProvider {
  constructor(bindName, container, fn, dependencies) {
    this.bindName = bindName;
    this.container = container;
    this.fn = fn;
    this.dependencies = dependencies || [];
  }

  async create() {
    const self = this;

    return async function(...args) {
      const dependencies = [];

      for(const dependency of self.dependencies) {
        if (dependency === utils._) {
          dependencies.push(args.shift());
        } else {
          dependencies.push(await self.container.resolve(dependency));
        }
      }

      return self.fn.call(this, ...dependencies);
    };
  }
}

module.exports = FunctionProvider;
