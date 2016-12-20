'use strict';

class ObjectBind {
  constructor(name, scope) {
    this._name = name;
    this._scope = scope;
  }

  async get() {
    return await this._scope.get();
  }
}

module.exports = ObjectBind;
