'use strict';

class FactoryBind {
  constructor(container, name, provider, BindValidator) {
    this._container = container;
    this._name = name;
    this._provider = provider;
    this._BindValidator = BindValidator;
  }

  get() {
    this.validate();
    return this._provider;
  }

  validate(state) {
    if (!this._validated) {
      new this._BindValidator(this._container, this._name, this._provider.dependencies || [])
        .validate(state);
      this._validated = true;
    }
  }
}

module.exports = FactoryBind;
