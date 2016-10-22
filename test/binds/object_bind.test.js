'use strict';

const { expect } = require('chai');
const ObjectBind = require('../../src/binds/object_bind');

describe('ObjectBind', function() {
  it('delegates the get to the given scope', function *() {
    let called = 0;

    const scope = {
      *get() {
        called++;
      }
    };

    const bind = new ObjectBind('name1', scope);

    yield bind.get();
    expect(called).to.equal(1);
  });
});

