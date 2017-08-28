'use strict';

const { expect } = require('chai');
const InstanceProvider = require('../../src/providers/instance_provider');

describe('InstanceProvider', function() {
  it('constructs the target with all of its dependencies', async function() {
    let called = 0;

    class Target {
      constructor(a, b) {
        this.a = a;
        this.b = b;

        called++;
        expect(a).to.equal('a1');
        expect(b).to.equal('b1');
      }

      async initialize() {
        // Should not be called
        called++;
      }
    }

    const container = {
      async resolveAll(dependencies) {
        called++;
        expect(dependencies).to.deep.equal(['a', 'b']);
        return ['a1', 'b1'];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, ['a', 'b']);
    const instance = await provider.create();

    expect(instance.a).to.equal('a1');
    expect(instance.b).to.equal('b1');
    expect(called).to.equal(2);
  });

  it('calls the initialize method if configured', async function() {
    let called = 0;

    class Target {
      async initialize() {
        called++;
      }
    }

    const container = {
      async resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: true
    });
    await provider.create();

    expect(called).to.equal(1);
  });

  it('calls the initialize method if configured with a different name', async function() {
    let called = 0;

    class Target {
      async init() {
        called++;
      }
    }

    const container = {
      async resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: 'init'
    });
    await provider.create();

    expect(called).to.equal(1);
  });

  it('throws an exception if the initialize method is not found', async function() {
    class Target {}

    const container = {
      async resolveAll() {
        return [];
      }
    };

    const provider = new InstanceProvider('name1', container, Target, [], {
      initialize: 'init'
    });

    try {
      await provider.create();
      throw new Error('should not be here');
    } catch (e) {
      expect(e).to.match(/Unable to find/);
    }
  });
});
