'use strict';

const { expect } = require('chai');
const SingletonScope = require('../../src/scopes/singleton_scope');

describe('SingletonScope', function() {
  it('creates and returns the same instance', async function() {
    let called = 0;

    const provider = async function() {
      called++;

      return {
        foo: 42
      };
    };

    const scope = new SingletonScope({ create: provider });

    const obj = await scope.get();
    expect(obj.foo).to.equal(42);

    const obj2 = await scope.get();
    expect(obj2.foo).to.equal(42);

    expect(obj).to.equal(obj2);
    expect(called).to.equal(1);
  });

  it('set-ups the returned object with a function', async function() {
    let called = 0;

    const obj = {
      foo: 42
    };

    const provider = async function() {
      return obj;
    };

    const setup = function(newObj) {
      called++;
      expect(newObj).to.equal(obj);
    };

    const scope = new SingletonScope({ create: provider }, { setup });

    await scope.get();
    await scope.get();

    expect(called).to.equal(1);
  });

  it('set-ups the returned object with an async function', async function () {
    let called = 0;

    const obj = {
      foo: 42
    };

    const provider = async function() {
      return obj;
    };

    const setup = async function(newObj) {
      called++;
      expect(newObj).to.equal(obj);
    };

    const scope = new SingletonScope({ create: provider }, { setup });

    await scope.get();
    await scope.get();

    expect(called).to.equal(1);
  });

  it('validates that the setup function is indeed a function', async function() {
    const provider = async function() {
      return {
        foo: 42
      };
    };

    try {
      const scope = new SingletonScope({ create: provider }, { setup: 123 });
      await scope.get();
      throw new Error('shouldnothappen');
    } catch (e) {
      expect(e.message).to.match(/Expected "setup" be to a function but got "123"./);
    }
  });
});
