'use strict';

const { expect } = require('chai');
const errors = require('../src/errors');

describe('Errors', function() {
  it('works as the build in Error', function() {
    const error = new errors.Error('Error 1');

    expect(error).to.be.an.instanceof(Error);
    expect(error).to.be.an.instanceof(errors.Error);
    expect(error.message).to.equal('Error 1');
    expect(error.stack).to.not.be.undefined;
  });
});
