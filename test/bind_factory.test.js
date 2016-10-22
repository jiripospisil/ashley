'use strict';

const { expect } = require('chai');
const BindFactory = require('../src/bind_factory');

describe('BindFactory', function() {
  it('throws an error for unknown bind', function() {
    const factory = new BindFactory({});
    expect(() => factory.create('unknown')).to.throw(Error);
  });

  it('creates a new instance and returns it', function() {
    let called = 0;

    const factory = new BindFactory({
      'known': class {
        constructor(container, name, scope, provider) {
          expect(container).to.equal('container1');
          expect(name).to.equal('name1');
          expect(scope).to.equal('scope1');
          expect(provider).to.equal('provider1');
          called++;
        }
      }
    });

    const bind = factory.create('known', 'container1', 'name1', 'scope1', 'provider1');
    expect(bind).to.be.an.instanceof(Object);
    expect(called).to.equal(1);
  });
});
