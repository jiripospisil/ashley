'use strict';

const { expect } = require('chai');
const { join } = require('path');

const TargetResolver = require('../src/target_resolver');

describe('TargetResolver', function() {
  context('when given object', function() {
    it('returns the target directly', function() {
      const obj = class {};
      const resolver = new TargetResolver();
      const target = resolver.resolve(obj);

      expect(target).to.equal(obj);
    });
  });

  context('when given something other than object or string', function() {
    it('throws an error', function() {
      const resolver = new TargetResolver();

      expect(() => resolver.resolve(123)).to.throw(/Invalid argument/);
    });
  });

  context('when given paths', function() {
    context('relative', function() {
      context('when NOT given the root path', function() {
        it('throws an error', function() {
          const resolver = new TargetResolver();
          expect(() => resolver.resolve('../src/target_resolver')).to.throw(/root option/);
        });
      });

      context('when given the root path', function() {
        it('resolves a valid target', function() {
          const resolver = new TargetResolver({ root: __dirname });
          const target = resolver.resolve('../src/target_resolver');

          expect(target).to.equal(TargetResolver);
        });

        it('throws an error when resolving an invalid target', function() {
          const resolver = new TargetResolver({ root: __dirname });

          expect(() => resolver.resolve('../src/i_do_not_exist')).to.throw(/Unable to load/);
        });
      });
    });

    context('absolute', function() {
      it('resolves a valid target', function() {
        const resolver = new TargetResolver();
        const target = resolver.resolve(join(__dirname, '../src/target_resolver'));

        expect(target).to.equal(TargetResolver);
      });

      it('throws an error when resolving an invalid target', function() {
        const resolver = new TargetResolver();

        expect(() => resolver.resolve(join(__dirname, '../src/i_do_not_exist'))).to.throw(/Unable to load/);
      });
    });
  });
});
