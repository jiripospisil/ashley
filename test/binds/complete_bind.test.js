'use strict';

const { expect } = require('chai');
const CompleteBind = require('../../src/binds/complete_bind');

describe('CompleteBind', function() {
  it('validates itself before calling the scope', async function() {
    let called = 0;

    const container = {
      findBind: function() {
        called++;
        return undefined;
      }
    };

    const provider = { dependencies: ['dep1'] };
    const bind = new CompleteBind(container, 'name1', 'scope1', provider);

    try {
      await bind.get();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to resolve/);
      expect(called).to.equal(1);
    }
  });

  it('delegates the get to the given scope', async function() {
    let called = 0;

    const scope = {
      async get() {
        called++;
      }
    };

    const bind = new CompleteBind('container1', 'name1', scope, 'provider1');

    await bind.get();
    expect(called).to.equal(1);
  });
});
