'use strict';

class ClassBind {
  constructor(name, clazz) {
    this._name = name;
    this._class = clazz;
  }

  get() {
    return this._class;
  }
}

module.exports = ClassBind;
