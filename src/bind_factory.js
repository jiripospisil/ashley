'use strict';

const errors = require('./errors');

/*
 * Holds all of the configured binds and creates their instances by name. It's
 * used by the container to create binds for the individual "binds". It's
 * abstracted so that the container doesn't depend on specific implementations
 * and can be configured with a different set implementations if necessary.
 */
class BindFactory {
  constructor(mapping, BindValidator) {
    this._mapping = mapping;
    this._BindValidator = BindValidator;
  }

  create(bindType, ...args) {
    if (this._mapping[bindType]) {
      args.push(this._BindValidator);
      return new this._mapping[bindType](...args);
    }

    throw new errors.Error(`Unknown bind "${bindType}".`);
  }
}

module.exports = BindFactory;
