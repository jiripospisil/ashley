'use strict';

const { expect } = require('chai');
const FactoryBind = require('../../src/binds/factory_bind');
const BindValidator = require('../../src/bind_validator');

describe('FactoryBind', function() {
  it('validates itself before returning the provider', async function() {
    let called = 0;

    const container = {
      findBind: function() {
        called++;
        return undefined;
      }
    };

    const provider = { dependencies: ['dep1'] };
    const bind = new FactoryBind(container, 'name1', provider, BindValidator);

    try {
      await bind.get();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to resolve/);
      expect(called).to.equal(1);
    }
  });

  it('returns the given provider', async function() {
    const bind = new FactoryBind('container1', 'name1', 'provider1', BindValidator);
    expect(bind.get()).to.equal('provider1');
  });
});
