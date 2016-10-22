'use strict';

const { expect } = require('chai');
const PrototypeScope = require('../../src/scopes/prototype_scope');

describe('PrototypeScope', function() {
  it('creates and returns always a new instance', function *() {
    let called = 0;

    const provider = function *() {
      called++;

      return {
        foo: 42
      };
    };

    const scope = new PrototypeScope({ create: provider });

    const obj = yield scope.get();
    expect(obj.foo).to.equal(42);

    const obj2 = yield scope.get();
    expect(obj2.foo).to.equal(42);

    expect(obj).to.not.equal(obj2);
    expect(called).to.equal(2);
  });

  it('set-ups the returned object with a function', function *() {
    let called = 0;

    const obj = {
      foo: 42
    };

    const provider = function *() {
      return obj;
    };

    const setup = function(newObj) {
      called++;
      expect(newObj).to.equal(obj);
    };

    const scope = new PrototypeScope({ create: provider }, { setup });

    yield scope.get();
    yield scope.get();

    expect(called).to.equal(2);
  });

  it('set-ups the returned object with a generator function', function *() {
    let called = 0;

    const obj = {
      foo: 42
    };

    const provider = function *() {
      return obj;
    };

    const setup = function *(newObj) {
      called++;
      expect(newObj).to.equal(obj);
    };

    const scope = new PrototypeScope({ create: provider }, { setup });

    yield scope.get();
    yield scope.get();

    expect(called).to.equal(2);
  });

  it('validates that the setup function is indeed a function', function *() {
    const provider = function *() {
      return {
        foo: 42
      };
    };

    try {
      const scope = new PrototypeScope({ create: provider }, { setup: 123 });
      yield scope.get();
      throw new Error('shouldnothappen');
    } catch (e) {
      expect(e.message).to.match(/Expected "setup" be to a function but got "123"./);
    }
  });
});
