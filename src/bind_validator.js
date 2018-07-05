'use strict';

const State = require('./state');
const utils = require('./utils');
const errors = require('./errors');

class BindValidator {
  constructor(container, bindName, dependencies) {
    this._container = container;
    this._bindName = bindName;
    this._dependencies = dependencies;
  }

  validate(state) {
    state = state || new State(this._bindName);

    this._dependencies.forEach(dep => {
      if (dep !== utils._) {
        this._validate(dep, state.fork());
      }
    });
  }

  _validate(dependencyName, state) {
    const bind = this._container.findBind(dependencyName);

    if (!bind) {
      throw new errors.Error(`Unable to resolve unbound dependency "${dependencyName}" as requested by "${state.top}".`);
    }

    if (state.has(dependencyName)) {
      throw new errors.Error(`Detected a cycle while trying to resolve dependencies for "${state.target}". The path was "${state.path(dependencyName)}".`);
    }

    if (bind.validate) {
      state.push(dependencyName);
      bind.validate(state);
    }
  }
}

module.exports = BindValidator;
