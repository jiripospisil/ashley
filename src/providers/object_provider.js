'use strict';

class ObjectProvider {
  constructor(bindName, container, target, options) {
    this.bindName = bindName;
    this._container = container;
    this._target = target;
    this._options = options;
  }

  *create() {
    return this._target;
  }
}

module.exports = ObjectProvider;
