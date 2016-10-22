'use strict';

const { expect } = require('chai');

const FactoryProvider = require('../../src/providers/factory_provider');

describe('FactoryProvider', function() {
  it('calls the provided function to get the instance', function *() {
    let called = 0;

    const fn = function() {
      called++;
      return 42;
    };

    const container = {
      *resolveAll(dependencies) {
        called++;
        expect(dependencies).to.deep.equal(['a', 'b']);
        return ['a1', 'b1'];
      }
    };

    const provider = new FactoryProvider('name1', container, fn, ['a', 'b']);
    const result = yield provider.create();

    expect(result).to.equal(42);
    expect(called).to.equal(2);
  });
});
