'use strict';

const { expect } = require('chai');
const FactoryBind = require('../../src/binds/factory_bind');

describe('FactoryBind', function() {
  it('delegates dependencies to the given provider', function() {
    const provider = { dependencies: ['dep1'] };
    const bind = new FactoryBind('container', 'name1', provider);
    expect(bind.dependencies).to.deep.equal(provider.dependencies);
  });

  it('validates itself before returning the provider', function *() {
    let called = 0;

    const container = {
      findBind: function() {
        called++;
        return undefined;
      }
    };

    const provider = { dependencies: ['dep1'] };
    const bind = new FactoryBind(container, 'name1', provider);

    try {
      yield bind.get();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to resolve/);
      expect(called).to.equal(1);
    }
  });

  it('returns the given provider', function *() {
    const bind = new FactoryBind('container1', 'name1', 'provider1');
    expect(bind.get()).to.equal('provider1');
  });
});
