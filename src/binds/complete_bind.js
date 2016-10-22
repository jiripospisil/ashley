'use strict';

const ValidatableBind = require('../validatable_bind');

class CompleteBind extends ValidatableBind {
  constructor(container, name, scope, provider) {
    super(container);

    this._name = name;
    this._scope = scope;
    this._provider = provider;
  }

  *get() {
    this.validate();
    return yield this._scope.get();
  }

  get dependencies() {
    return this._provider.dependencies || [];
  }
}

module.exports = CompleteBind;
