'use strict';

const { expect } = require('chai');
const ObjectBind = require('../../src/binds/object_bind');

describe('ObjectBind', function() {
  it('delegates the get to the given scope', async function() {
    let called = 0;

    const scope = {
      async get() {
        called++;
      }
    };

    const bind = new ObjectBind('name1', scope);

    await bind.get();
    expect(called).to.equal(1);
  });
});

