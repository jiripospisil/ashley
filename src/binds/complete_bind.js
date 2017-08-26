'use strict';

class CompleteBind {
  constructor(container, name, scope, provider, BindValidator) {
    this._container = container;
    this._name = name;
    this._scope = scope;
    this._provider = provider;
    this._BindValidator = BindValidator;

    this._validated = false;
  }

  async get() {
    this.validate();
    return this._scope.get();
  }

  validate(state) {
    if (!this._validated) {
      new this._BindValidator(this._container, this._name, this._provider.dependencies || [])
        .validate(state);
      this._validated = true;
    }
  }
}

module.exports = CompleteBind;
