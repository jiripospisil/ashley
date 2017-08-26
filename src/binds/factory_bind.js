'use strict';

const BindValidator = require('../bind_validator');

class FactoryBind {
  constructor(container, name, provider) {
    this._container = container;
    this._name = name;
    this._provider = provider;
  }

  get() {
    this.validate();
    return this._provider;
  }

  validate(state) {
    if (!this._validated) {
      new BindValidator(this._container, this._name, this._provider.dependencies || [])
        .validate(state);
      this._validated = true;
    }
  }
}

module.exports = FactoryBind;
