'use strict';

const _ = require('lodash');

/*
 * A stack like data structure that's used as part of the cycle detection phase.
 * It holds the target plus its flattened chain of dependencies. It's queried to
 * see whether a particular dependency has been seen before.
 */
class State {
  constructor(chain) {
    if (_.isArray(chain)) {
      this._chain = chain;
    } else {
      this._chain = [chain];
    }
  }

  get target() {
    return _.first(this._chain);
  }

  get top() {
    return _.last(this._chain);
  }

  has(target) {
    return _.includes(this._chain, target);
  }

  push(target) {
    this._chain.push(target);
  }

  fork() {
    return new State(_.clone(this._chain));
  }

  path(last) {
    let inCycle = false;
    return _.concat(this._chain, last).map((curr, idx, col) => {
      // The last path
      if (idx === col.length - 1) {
        return curr;
      }

      // The start of the cycle
      if (curr === last) {
        inCycle = true;
      }

      if (inCycle) {
        return `${curr} ⇄`;
      } else {
        return `${curr} →`;
      }
    }).join(' ');
  }
}

module.exports = State;
