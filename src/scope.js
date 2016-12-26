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

  async _setupInstance(instance) {
    const { setup } = this.options;

    if (setup) {
      if (utils.isAsyncFunction(setup)) {
        await setup(instance);
      } else if (_.isFunction(setup)) {
        setup(instance);
      } else {
        throw new errors.Error(`Expected "setup" be to a function but got "${setup}".`);
      }
    }
  }
}

module.exports = Scope;
