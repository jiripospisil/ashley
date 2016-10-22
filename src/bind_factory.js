'use strict';

const errors = require('./errors');

/*
 * Holds all of the configured binds and creates their instances by name. It's
 * used by the container to create binds for the individual "binds". It's
 * abstracted so that the container doesn't depend on specific implementations
 * and can be configured with a different set implementations if necessary.
 */
class BindFactory {
  constructor(mapping) {
    this.mapping = mapping;
  }

  create(bindType, container, name, scope, provider) {
    if (this.mapping[bindType]) {
      return new this.mapping[bindType](container, name, scope, provider);
    }

    throw new errors.Error(`Unknown bind "${bindType}".`);
  }
}

module.exports = BindFactory;
