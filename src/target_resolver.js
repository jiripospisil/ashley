'use strict';

const _ = require('lodash');
const path = require('path');
const debug = require('debug')('Ashley::TargetResolver');

const errors = require('./errors');

/*
 * Ashley allows to specify the target of a binding in two ways.
 *
 * ashley.instance('Service', Service);
 * ashley.instance('Service', 'src/service');
 *
 * In the first variant, the target is provided directly as a reference. In the
 * other, the target is specified using a string path. The path can be both
 * relative and absolute. If relative, the options need to include a key which
 * specifies the root. A result of TargetResolver is always a reference to an
 * object.
 *
 */
class TargetResolver {
  constructor(options) {
    this.options = options || {};
    this.cache = {};
  }

  resolve(target) {
    if (_.isObject(target)) {
      debug(`Resolved "${_.get(target, 'name', target)}" to a reference.`);
      return target;
    }

    debug(`Resolving "${target}".`);

    if (!_.isString(target)) {
      throw new errors.Error(`Invalid argument given as target: "${target}".`);
    }

    if (path.isAbsolute(target)) {
      return this._resolveAbsolute(target);
    }

    return this._resolveRelative(target);
  }

  _resolveAbsolute(target) {
    debug(`Resolving "${target}" as an absolute path.`);
    return this._loadTarget(target);
  }

  _resolveRelative(target) {
    debug(`Resolving "${target}" as a relative path.`);

    const { root } = this.options;
    if (!root) {
      throw new errors.Error(`A relative path "${target}" given but the root option is not specified.`);
    }

    const filepath = path.resolve(root, target);
    debug(`Resolved the relative path to "${filepath}".`);

    return this._loadTarget(filepath);
  }

  _loadTarget(filepath) {
    try {
      const obj = require(`${filepath}`);
      debug(`Succesfully loaded "${filepath}".`);
      return obj;
    } catch (e) {
      throw new errors.Error(`Unable to load "${filepath}": ${e.stack}`);
    }
  }
}

module.exports = TargetResolver;
