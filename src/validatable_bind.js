'use strict';

const debug = require('debug')('Ashley::Bind');

const State = require('./state');
const utils = require('./utils');
const errors = require('./errors');

class ValidatableBind {
  constructor(container) {
    this.container = container;
    this.validated = false;
  }

  validate(state) {
    if (!this.validated) {
      state = state || new State(this._name);

      this.dependencies.forEach(dep => {
        if (dep !== utils._) {
          this._validate(dep, state.fork());
        }
      });

      this.validated = true;
    }
  }

  invalidate() {
    debug(`Invalidating "${this._name}".`);
    this.validated = false;
  }

  _validate(dependencyName, state) {
    const bind = this.container.findBind(dependencyName);

    if (!bind) {
      throw new errors.Error(`Unable to resolve unbinded dependency "${dependencyName}" as requested by "${state.top}".`);
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

module.exports = ValidatableBind;
