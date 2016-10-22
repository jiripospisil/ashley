'use strict';

module.exports.Error = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'AshleyError';
    Error.captureStackTrace(this, this.constructor);
  }
};
