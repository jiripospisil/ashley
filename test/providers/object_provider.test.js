'use strict';

const { expect } = require('chai');
const ObjectProvider = require('../../src/providers/object_provider');

describe('ObjectProvider', function() {
  it('returns the target', function *() {
    const provider = new ObjectProvider('name1', 'container1', 'target1', 'options');
    expect(yield provider.create()).to.equal('target1');
  });
});
