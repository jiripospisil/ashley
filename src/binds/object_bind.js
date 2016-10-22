'use strict';

class ObjectBind {
  constructor(name, scope) {
    this._name = name;
    this._scope = scope;
  }

  *get() {
    return yield this._scope.get();
  }
}

module.exports = ObjectBind;
