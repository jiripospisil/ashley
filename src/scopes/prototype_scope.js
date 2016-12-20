'use strict';

const Scope = require('../scope');

class PrototypeScope extends Scope {
  async get() {
    const instance = await this.provider.create();
    await this._setupInstance(instance);
    return instance;
  }
}

module.exports = PrototypeScope;
