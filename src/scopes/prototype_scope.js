'use strict';

const Scope = require('../scope');

class PrototypeScope extends Scope {
  constructor(provider, options) {
    super(provider, options);
    this._instances = [];
  }

  async get() {
    const instance = await this.provider.create();
    await this._setupInstance(instance);

    if (this.options.deinitialize) {
      this._instances.push(instance);
    }

    return instance;
  }

  async deinitialize() {
    const instances = this._instances;
    this._instances = [];

    for (const instance of instances) {
      await this.provider.deinitializeInstance(instance);
    }
  }
}

module.exports = PrototypeScope;
