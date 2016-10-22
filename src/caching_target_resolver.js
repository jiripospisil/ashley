'use strict';

const _ = require('lodash');
const debug = require('debug')('Ashley::CachingTargetResolver');

/*
 * Target resolving is a fairly frequent operation as it's done for every
 * container, at least at the beginning. This becomes a problem once new
 * containers are created many times during the application's life time (e.g.
 * for every request). CachingTargetResolver solves the problem by resolving the
 * target only once by delegating the request to the passed-in resolver and
 * caching the result.
 *
 * Note that child containers share the cache with their parents unless
 * explicitly opted out.
 */
class CachingTargetResolver {
  constructor(resolver) {
    this._resolver = resolver;
    this._cache = {};
  }

  resolve(target) {
    if (this._cache[target]) {
      debug(`Resolved "${_.get(target, 'name', target)}" from cache.`);
      return this._cache[target];
    }

    return this._cache[target] = this._resolver.resolve(target);
  }
}

module.exports = CachingTargetResolver;
