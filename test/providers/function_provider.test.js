'use strict';

const { expect } = require('chai');
const _ = require('lodash');

const utils = require('./../../src/utils');
const FunctionProvider = require('../../src/providers/function_provider');

describe('FunctionProvider', function() {
  it('returns a function which gets invoked with the dependencies', function *() {
    let called = 0;

    const fn = function(a, b) {
      called++;
      expect(a).to.equal('a1');
      expect(b).to.equal('b1');
    };

    const container = {
      *resolve(dependency) {
        called++;
        if (_.includes(['a', 'b'], dependency)) {
          return `${dependency}1`;
        }
        throw new Error('wrong dependency');
      }
    };

    const provider = new FunctionProvider('name1', container, fn, ['a', 'b']);
    const result = yield provider.create();
    yield result();

    expect(called).to.equal(3);
  });

  it('supports optional placeholders what will be replaced with actual values', function *() {
    let called = 0;

    const fn = function(a, b, c, d) {
      called++;
      expect(a).to.equal('a1');
      expect(b).to.equal('b1');
      expect(c).to.equal('c1');
      expect(d).to.equal('d1');
    };

    const container = {
      *resolve(dependency) {
        called++;
        if (_.includes(['a', 'c'], dependency)) {
          return `${dependency}1`;
        }
        throw new Error('wrong dependency');
      }
    };

    const provider = new FunctionProvider('name1', container, fn, ['a', utils._, 'c', utils._]);
    const result = yield provider.create();
    yield result('b1', 'd1');

    expect(called).to.equal(3);
  });
});
