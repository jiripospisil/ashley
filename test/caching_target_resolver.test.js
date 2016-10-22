'use strict';

const { expect } = require('chai');
const CachingTargetResolver = require('../src/caching_target_resolver');

describe('CachingTargetResolver', function() {
  it('delegates to the passed resolver and caches the result', function() {
    let called = 0;

    const resolver = function(target) {
      called++;
      expect(target).to.equal('target1');
      return 123;
    };

    const cachingResolver = new CachingTargetResolver({ resolve: resolver });

    expect(cachingResolver.resolve('target1')).to.equal(123);
    expect(cachingResolver.resolve('target1')).to.equal(123);
    expect(called).to.equal(1);
  });
});
