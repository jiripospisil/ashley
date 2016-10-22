'use strict';

const { expect } = require('chai');
const CloneScope = require('../../src/scopes/clone_scope');

describe('CloneScope', function() {
  it('returns the binded object', function *() {
    let called = 0;

    const initial = { foo: 42 };
    const provider = function *() {
      called++;
      return initial;
    };

    const scope = new CloneScope({ create: provider });

    const obj = yield scope.get();
    expect(obj.foo).to.equal(42);

    const obj2 = yield scope.get();
    expect(obj2.foo).to.equal(42);

    expect(obj).to.equal(obj2);
    expect(called).to.equal(2);
  });

  it('can return a clone of the binded object', function *() {
    let called = 0;

    const initial = { foo: 42 };
    const provider = function *() {
      called++;
      return initial;
    };

    const scope = new CloneScope({ create: provider }, {
      clone: true
    });

    const obj = yield scope.get();
    expect(obj.foo).to.equal(42);

    const obj2 = yield scope.get();
    expect(obj2.foo).to.equal(42);

    expect(obj).to.not.equal(obj2);
    expect(called).to.equal(2);
  });

  it('allows to specify a custom clone function', function *() {
    let called = 0;

    const initial = { foo: 42 };
    const provider = function *() {
      called++;
      return initial;
    };

    const scope = new CloneScope({ create: provider }, {
      clone: obj => {
        called++;
        expect(obj).to.equal(initial);
        return 43;
      }
    });

    const obj = yield scope.get();
    expect(obj).to.equal(43);

    expect(called).to.equal(2);
  });

  it('validates the clone option', function *() {
    const initial = { foo: 42 };
    const provider = function *() {
      return initial;
    };

    const scope = new CloneScope({ create: provider }, {
      clone: 'not_a_function'
    });

    try {
      yield scope.get();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/be to a function or "true" but got "not_a_function"/);
    }
  });
});
