'use strict';

const _ = require('lodash');

const utils = require('../utils');
const errors = require('../errors');

class InstanceProvider {
  constructor(bindName, container, target, dependencies, options) {
    this.bindName = bindName;
    this.container = container;
    this.target = target;
    this.dependencies = dependencies;

    this.options = _.defaults(options, {
      initialize: false
    });
  }

  *create() {
    const dependencies = yield this.container.resolveAll(this.dependencies);
    const instance = new this.target(...dependencies);

    if (this.options.initialize) {
      yield this._initializeInstance(instance);
    }

    return instance;
  }

  *_initializeInstance(instance) {
    const { initialize } = this.options;
    const methodName = this._lifeCycleMethodName(initialize, 'initialize');

    if (instance[methodName] && utils.isGeneratorFunction(instance[methodName])) {
      return yield instance[methodName].call(instance);
    }

    throw new errors.Error(`Unable to find a generator method called "${methodName}" on an instance of "${this.bindName}".`);
  }

  *deinitializeInstance(instance) {
    if (!instance) {
      return;
    }

    const { deinitialize } = this.options;
    const methodName = this._lifeCycleMethodName(deinitialize, 'deinitialize');

    if (instance[methodName] && utils.isGeneratorFunction(instance[methodName])) {
      return yield instance[methodName].call(instance);
    }

    throw new errors.Error(`Unable to find a generator method called "${methodName}" on an instance of "${this.bindName}".`);
  }

  _lifeCycleMethodName(value, defaultValue) {
    if (value === true) {
      return defaultValue;
    }
    return value;
  }
}

module.exports = InstanceProvider;
