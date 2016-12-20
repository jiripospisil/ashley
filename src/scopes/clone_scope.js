'use strict';

const _ = require('lodash');

const utils = require('../utils');
const errors = require('../errors');
const Scope = require('../scope');

class CloneScope extends Scope {
  async get() {
    const instance = await this.provider.create();

    if (this.options.clone) {
      return await this._clone(instance);
    }

    return instance;
  }

  async _clone(instance) {
    const { clone } = this.options;

    if (clone === true) {
      return _.cloneDeep(instance);
    }

    if (utils.isAsyncFunction(clone)) {
      return await clone(instance);
    }

    if (_.isFunction(clone)) {
      return clone(instance);
    }

    throw new errors.Error(`Expected "clone" be to a function or "true" but got "${clone}".`);
  }
}

module.exports = CloneScope;
