'use strict';

/*
 * The placeholder is used to denote a parameter that will be automatically passed
 * as part of the injected dependencies.
 */
module.exports._ = '<ARG_PLACEHOLDER>';

module.exports.isAsyncFunction = function(fn) {
  if (!fn || !fn.constructor) {
    return false;
  }

  return fn.constructor.name === 'AsyncFunction';
};
