'use strict';

const _ = require('lodash');

const utils = require('./utils');
const errors = require('./errors');

class Scope {
  constructor(provider, options) {
    this.provider = provider;
    this.options = _.defaults(options, {
      setup: false,
      clone: false
    });
  }

  *_setupInstance(instance) {
    const { setup } = this.options;

    if (setup) {
      if (utils.isGeneratorFunction(setup)) {
        yield setup(instance);
      } else if (_.isFunction(setup)) {
        setup(instance);
      } else {
        throw new errors.Error(`Expected "setup" be to a function but got "${setup}".`);
      }
    }
  }

  *handleMessage(type, ...args) {
    const fn = this[type];

    if (!fn) {
      return;
    }

    if (utils.isGeneratorFunction(fn)) {
      yield fn.call(this, ...args);
    } else if (_.isFunction(fn)) {
      fn.call(this, ...args);
    }
  }
}

module.exports = Scope;
