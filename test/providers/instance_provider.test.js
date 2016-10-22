'use strict';

const { expect } = require('chai');
const InstanceProvider = require('../../src/providers/instance_provider');

describe('InstanceProvider', function() {
  it('constructs the target with all of its dependencies', function *() {
    let called = 0;

    class Target {
      constructor(a, b) {
        this.a = a;
        this.b = b;

        called++;
        expect(a).to.equal('a1');
        expect(b).to.equal('b1');
      }

      *initialize() {
        // Should not be called
        called++;
      }
    }

    const container = {
      *resolveAll(dependencies) {
        called++;
        expect(dependencies).to.deep.equal(['a', 'b']);
        return ['a1', 'b1'];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, ['a', 'b']);
    const instance = yield provider.create();

    expect(instance.a).to.equal('a1');
    expect(instance.b).to.equal('b1');
    expect(called).to.equal(2);
  });

  it('calls the initialize method if configured', function *() {
    let called = 0;

    class Target {
      *initialize() {
        called++;
      }
    }

    const container = {
      *resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: true
    });
    yield provider.create();

    expect(called).to.equal(1);
  });

  it('calls the initialize method if configured with a different name', function *() {
    let called = 0;

    class Target {
      *init() {
        called++;
      }
    }

    const container = {
      *resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: 'init'
    });
    yield provider.create();

    expect(called).to.equal(1);
  });

  it('throws an exception if the initialize method is not found', function *() {
    class Target {}

    const container = {
      *resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: 'init'
    });

    try {
      yield provider.create();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to find/);
    }
  });

  it('throws an exception if the initialize method is found but it\'s not a generator', function *() {
    class Target {
      init() {}
    }

    const container = {
      *resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: 'init'
    });

    try {
      yield provider.create();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to find/);
    }
  });
});
