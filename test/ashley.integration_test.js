'use strict';

const _ = require('lodash');
const co = require('co');
const { expect } = require('chai');

const Scope = require('../src/scope');
const Ashley = require('../index');

describe('Ashley', function() {
  describe('#instance', function() {
    it('allows to bind an instance', function *() {
      class Class {}

      const ashley = new Ashley();
      ashley.instance('Instance', Class);

      expect(yield ashley.resolve('Instance')).to.be.an.instanceof(Class);
    });

    it('returns a generator function which resolves to the instance', function *() {
      class Class {}

      const ashley = new Ashley();
      const fn = ashley.instance('Instance', Class);

      expect(yield fn()).to.be.an.instanceof(Class);
    });

    it('can be wrapped to return a promise', function(done) {
      class Class {}

      const ashley = new Ashley();
      const fn = co.wrap(ashley.instance('Instance', Class));

      fn().then(instance => {
        expect(instance).to.be.an.instanceof(Class);
        done();
      });
    });

    it('creates implicit factories', function *() {
      class Class {}

      const ashley = new Ashley();
      ashley.instance('Instance', Class);

      const factory = yield ashley.resolve('@factories/Instance');
      const instance1 = yield factory.create();
      const instance2 = yield factory.create();

      expect(instance1).to.be.an.instanceof(Class);
      expect(instance2).to.be.an.instanceof(Class);
      expect(instance1).to.not.equal(instance2);
    });

    it('allows to set up individual instances', function *() {
      let called = 0;
      class Class {}

      const ashley = new Ashley();
      ashley.instance('Instance', Class);
      ashley.instance('Instance2', Class, [], {
        setup: obj => {
          called++;
          expect(obj).to.be.an.instanceof(Class);
        }
      });

      yield ashley.resolveAll(['Instance', 'Instance2']);
      expect(called).to.equal(1);
    });

    it('throws an error if there\'s already a bind with the same name', function() {
      class Class {}

      const ashley = new Ashley();
      ashley.instance('Instance', Class);

      expect(() => {
        ashley.instance('Instance', Class);
      }).to.throw(Error, /There\'s already a bind called "Instance"/);
    });

    describe('scopes', function() {
      it('allows to specify the Singleton scope', function *() {
        class Class {}

        const ashley = new Ashley();
        ashley.instance('Instance', Class, [], {
          scope: 'Singleton'
        });

        const instance1 = yield ashley.resolve('Instance');
        const instance2 = yield ashley.resolve('Instance');

        expect(instance1).to.equal(instance2);
      });

      it('defaults to the Singleton scope', function *() {
        class Class {}

        const ashley = new Ashley();
        ashley.instance('Instance', Class);

        const [instance1, instance2] = yield ashley.resolveAll(['Instance', 'Instance']);
        expect(instance1).to.equal(instance2);
      });

      it('allows to specify the Prototype scope', function *() {
        class Class {}

        const ashley = new Ashley();
        ashley.instance('Instance', Class, [], {
          scope: 'Prototype'
        });

        const [instance1, instance2] = yield ashley.resolveAll(['Instance', 'Instance']);
        expect(instance1).to.not.equal(instance2);
      });

      it('allows to specify a custom scope', function *() {
        let called = 0;

        class Class {}
        class CustomPrototypeScope extends Scope {
          *get() {
            called++;
            return yield this.provider.create();
          }
        }

        const ashley = new Ashley();
        ashley.scope('CustomPrototypeScope', CustomPrototypeScope);
        ashley.instance('Instance', Class, [], {
          scope: 'CustomPrototypeScope'
        });

        const [instance1, instance2] = yield ashley.resolveAll(['Instance', 'Instance']);

        expect(instance1).to.not.equal(instance2);
        expect(called).to.equal(2);
      });

      it('throws when given an unknown scope', function() {
        class Class {}

        const ashley = new Ashley();

        expect(() => {
          ashley.instance('Instance', Class, [], {
            scope: 'Nope'
          });
        }).to.throw(Error, /Unable to find a bind called "@scopes\/Nope"/);
      });
    });

    describe('initialize', function() {
      it('throws an error if the class doesn\'t implement the initialize method', function *() {
        class Class {}

        const ashley = new Ashley();
        ashley.instance('Instance', Class, [], {
          initialize: true
        });

        try {
          yield ashley.resolve('Instance');
          throw new Error('should not be here');
        } catch (e) {
          expect(e).to.be.an.instanceof(Error);
        }
      });

      it('initializes the instance every time with the Prototype scope', function *() {
        let called = 0;

        class Class {
          *initialize() {
            called++;
          }
        }

        const ashley = new Ashley();
        ashley.instance('Instance', Class, [], {
          scope: 'Prototype',
          initialize: true
        });

        const [instance1, instance2] = yield ashley.resolveAll(['Instance', 'Instance']);

        expect(instance1).to.not.equal(instance2);
        expect(called).to.equal(2);
      });

      it('initializes the instance only once with the Singleton scope', function *() {
        let called = 0;

        class Class {
          *initialize() {
            called++;
          }
        }

        const ashley = new Ashley();
        ashley.instance('Instance', Class, [], {
          scope: 'Singleton',
          initialize: true
        });

        const [instance1, instance2] = yield ashley.resolveAll(['Instance', 'Instance']);

        expect(instance1).to.equal(instance2);
        expect(called).to.equal(1);
      });
    });

    describe('dependencies', function() {
      it('allows to specify dependencies', function *() {
        let called = 0;

        class Dependency {
          constructor() {
            called++;
          }
        }

        class Dependency2 {
          constructor(dep1) {
            called++;
            expect(dep1).to.be.an.instanceof(Dependency);
          }

          *initialize() {
            called++;
          }
        }

        class Class {
          constructor(dep1, dep2, dep3, dep4) {
            called++;
            expect(dep1).to.be.an.instanceof(Dependency);
            expect(dep2).to.be.an.instanceof(Dependency);
            expect(dep3).to.be.an.instanceof(Dependency2);
            expect(dep4).to.be.an.instanceof(Dependency2);
            expect(dep3).to.be.equal(dep4);
          }
        }

        const ashley = new Ashley();
        ashley.instance('Dependency', Dependency, [], {
          scope: 'Prototype'
        });
        ashley.instance('Dependency2', Dependency2, ['Dependency'], {
          initialize: true
        });
        ashley.instance('Instance', Class, ['Dependency', 'Dependency', 'Dependency2', 'Dependency2']);

        expect(yield ashley.resolve('Instance')).to.be.an.instanceof(Class);
        expect(called).to.equal(6);
      });
    });

  });

  describe('#object', function() {
    it('allows to bind simple objects', function *() {
      const obj = {
        key: 42
      };

      const ashley = new Ashley();
      ashley.object('Object', obj);

      const [obj1, obj2] = yield ashley.resolveAll(['Object', 'Object']);

      expect(obj1).to.deep.equal(obj);
      expect(obj1).to.equal(obj2);
    });

    it('returns a generator function which resolves to the object', function *() {
      const obj = {
        key: 42
      };

      const ashley = new Ashley();
      const fn = ashley.object('Object', obj);

      expect(yield fn()).to.be.deep.equal(obj);
    });

    describe('clone', function() {
      it('allows to clone each resolved object', function *() {
        const obj = {
          key: 42
        };

        const ashley = new Ashley();
        ashley.object('Object', obj, {
          clone: true
        });

        const [obj1, obj2] = yield ashley.resolveAll(['Object', 'Object']);

        expect(obj1).to.deep.equal(obj);
        expect(obj1).to.not.equal(obj2);
      });

      it('allows to clone each resolved object with a custom function', function *() {
        const obj = {
          key: 42
        };

        let called = 0;

        const ashley = new Ashley();
        ashley.object('Object', obj, {
          clone: obj => {
            called++;
            return _.cloneDeep(obj);
          }
        });

        const [obj1, obj2] = yield ashley.resolveAll(['Object', 'Object']);

        expect(obj1).to.deep.equal(obj);
        expect(obj1).to.not.equal(obj2);
        expect(called).to.equal(2);
      });
    });
  });

  describe('#function', function() {
    it('allows to bind a function', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.function('Func', () => called++);

      const fn = yield ashley.resolve('Func');
      yield fn();
      yield fn();

      expect(called).to.equal(2);
    });

    it('returns a generator function which resolves to the function', function *() {
      let called = 0;
      const ashley = new Ashley();
      const fn = ashley.function('Func', () => called++);

      yield (yield fn())();
      yield (yield fn())();

      expect(called).to.equal(2);
    });

    it('allows to bind a function with dependencies', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.object('Param1', 42);
      ashley.object('Param2', 43);
      ashley.function('Func', (a, b) => {
        called++;
        expect(a).to.equal(42);
        expect(b).to.equal(43);
      }, ['Param1', 'Param2']);

      const fn = yield ashley.resolve('Func');
      yield fn();

      expect(called).to.equal(1);
    });

    it('allows to bind a function with parameters', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.function('Func', (a, b) => {
        called++;
        expect(a).to.equal(42);
        expect(b).to.equal(43);
      }, [Ashley._, Ashley._]);

      const fn = yield ashley.resolve('Func');
      yield fn(42, 43);

      expect(called).to.equal(1);
    });

    it('allows to bind a function with parameters and dependencies', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.object('Param1', 42);
      ashley.object('Param2', 44);
      ashley.function('Func', (a, b, c, d) => {
        called++;
        expect(a).to.equal(42);
        expect(b).to.equal(43);
        expect(c).to.equal(44);
        expect(d).to.be.undefined;
      }, ['Param1', Ashley._, 'Param2', Ashley._]);

      const fn = yield ashley.resolve('Func');
      yield fn(43);

      expect(called).to.equal(1);
    });
  });

  describe('#factory', function() {
    it('allows to bind and link a factory', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.factory('Date', () => {
        called++;
        return new Date();
      });
      ashley.link('StartDate', 'Date');

      const [date1, date2] = yield ashley.resolveAll(['StartDate', 'StartDate']);

      expect(date1).be.an.instanceof(Date);
      expect(date2).be.an.instanceof(Date);
      expect(date1.toISOString()).to.equal(date2.toISOString());
      expect(called).to.equal(1);
    });

    it('allows to retrieve the underlying factory function', function *() {
      const ashley = new Ashley();
      ashley.factory('Date', () => new Date());

      const date = yield ashley.resolve('@factories/Date');
      expect(yield date.create()).be.an.instanceof(Date);
    });
  });

  describe('#validate', function() {
    it('validates that all dependencies are binded', function() {
      const ashley = new Ashley();
      ashley.instance('Dependency1', class {});
      ashley.instance('Dependency2', class {}, ['Dependency1']);
      ashley.instance('Instance', class {}, ['Dependency1', 'Dependency2']);

      expect(() => ashley.validate()).to.not.throw(Error);
    });

    it('throws an Error when one of the dependencies is missing', function() {
      const ashley = new Ashley();
      ashley.instance('Dependency1', class {});
      ashley.instance('Dependency2', class {}, ['Dependency1']);
      ashley.instance('Instance', class {}, ['Dependency1', 'Dependency3']);

      expect(() => ashley.validate()).to.throw(Error);
    });
  });

  describe('#shutdown', function() {
    it('calls deinitialize on all binds which support it', function *() {
      let called = 0;

      const ashley = new Ashley();
      ashley.instance('Dependency1', class {
        *deinitialize() {
          called++;
        }
      }, [], { deinitialize: true });
      yield ashley.resolve('Dependency1');

      ashley.instance('Dependency2', class {
        *deinit() {
          called++;
        }
      }, [], { deinitialize: 'deinit' });
      yield ashley.resolve('Dependency2');

      // Not initialized
      ashley.instance('Dependency3', class {
        *deinitialize() {
          called++;
        }
      }, [], { deinitialize: true });

      ashley.instance('Dependency4', class {
        *deinit() {
          called++;
        }
      }, [], { deinitialize: true, scope: 'Prototype' });

      yield ashley.shutdown();

      expect(called).to.equal(2);
    });
  });

  describe('#createChild', function() {
    it('creates a child container which shares the binds', function *() {
      let called = 0;
      class Class {}
      class Class2 {
        constructor(clazz) {
          called++;
          expect(clazz).to.be.an.instanceof(Class);
        }
      }

      const parent = new Ashley();
      parent.instance('Instance', Class);
      const child = parent.createChild();
      child.instance('Instance2', Class2, ['Instance']);

      expect(() => child.validate()).to.not.throw(Error);
      expect(yield child.resolve('Instance2')).to.be.an.instanceof(Class2);
      expect(called).to.equal(1);
    });
  });
});
