'use strict';

const { expect } = require('chai');
const Scope = require('../src/scope');

describe('Scope', function() {
  it('forwards messages to functions', async function() {
    let called = 0;

    const instance = new class extends Scope {
      reset(a, b) {
        expect(this).to.not.be.undefined;
        expect(a).to.equal(1);
        expect(b).to.equal(2);
        called++;
      }
    };

    await instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(1);
  });

  it('forwards messages to async functions', async function() {
    let called = 0;

    const instance = new class extends Scope {
      async reset(a, b) {
        expect(this).to.not.be.undefined;
        expect(a).to.equal(1);
        expect(b).to.equal(2);
        called++;
      }
    };

    await instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(1);
  });

  it('doesn\'t mind if the receiver doesn\'t implement the method', async function() {
    let called = 0;

    const instance = new class extends Scope {};

    await instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(0);
  });
});
