'use strict';

const { expect } = require('chai');
const Scope = require('../src/scope');

describe('Scope', function() {
  it('forwards messages to functions', function *() {
    let called = 0;

    const instance = new class extends Scope {
      reset(a, b) {
        expect(this).to.not.be.undefined;
        expect(a).to.equal(1);
        expect(b).to.equal(2);
        called++;
      }
    };

    yield instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(1);
  });

  it('forwards messages to generator functions', function *() {
    let called = 0;

    const instance = new class extends Scope {
      *reset(a, b) {
        expect(this).to.not.be.undefined;
        expect(a).to.equal(1);
        expect(b).to.equal(2);
        called++;
      }
    };

    yield instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(1);
  });

  it('doesnt mind if the receiver doesnt implement the method', function *() {
    let called = 0;

    const instance = new class extends Scope {};

    yield instance.handleMessage('reset', 1, 2);
    expect(called).to.equal(0);
  });
});
