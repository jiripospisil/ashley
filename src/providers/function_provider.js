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
    return async (...args) => {
      const dependencies = [];

      for(const dependency of this.dependencies) {
        if (dependency === utils._) {
          dependencies.push(args.shift());
        } else {
          dependencies.push(await this.container.resolve(dependency));
        }
      }

      return this.fn.call(null, ...dependencies);
    };
  }
}

module.exports = FunctionProvider;
