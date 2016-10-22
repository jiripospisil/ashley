'use strict';

const Scope = require('../scope');

class PrototypeScope extends Scope {
  *get() {
    const instance = yield this.provider.create();
    yield this._setupInstance(instance);
    return instance;
  }
}

module.exports = PrototypeScope;
