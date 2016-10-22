'use strict';

const ValidatableBind = require('../validatable_bind');

class FactoryBind extends ValidatableBind {
  constructor(container, name, provider) {
    super(container);

    this._name = name;
    this._provider = provider;
  }

  get() {
    this.validate();
    return this._provider;
  }

  get dependencies() {
    return this._provider.dependencies || [];
  }
}

module.exports = FactoryBind;
