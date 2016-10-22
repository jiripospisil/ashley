'use strict';

const { expect } = require('chai');
const ValidatableBind = require('../src/validatable_bind');

describe('ValidatableBind', function() {
  class Bind extends ValidatableBind {
    constructor(name, container, dependencies) {
      super(container);
      this._name = name;
      this._dependencies = dependencies;
    }

    get dependencies() {
      return this._dependencies;
    }
  }

  class SimpleBind {
    constructor(name) {
      this._name = name;
    }
  }

  class Container {
    constructor() {
      this._binds = {};
    }

    addBind(name, dependencies) {
      return this._binds[name] = new Bind(name, this, dependencies);
    }

    addSimpleBind(name) {
      return this._binds[name] = new SimpleBind(name);
    }

    findBind(name) {
      return this._binds[name];
    }
  }

  it('allows binds without any dependencies', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', []);

    expect(() => bind1.validate()).to.not.throw(Error);
  });

  it('throws when any of the dependencies is not found #1', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2']);

    expect(() => bind1.validate()).to.throw(Error, /unbinded dependency "Bind2" as requested by "Bind1"/);
  });

  it('throws when any of the dependencies is not found #2', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2']);
    container.addBind('Bind2', ['Bind3', 'Bind4']);
    container.addBind('Bind3', []);
    container.addBind('Bind4', ['Bind5']);

    expect(() => bind1.validate()).to.throw(Error, /unbinded dependency "Bind5" as requested by "Bind4"/);
  });

  it('allows correct chains #1', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2']);
    container.addBind('Bind2', ['Bind3', 'Bind4']);
    container.addBind('Bind3', []);
    container.addBind('Bind4', ['Bind3']);

    expect(() => bind1.validate()).to.not.throw(Error);
  });

  it('allows correct chains #2', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2', 'Bind3']);
    container.addBind('Bind2', ['Bind4', 'Bind5', 'Bind3']);
    container.addBind('Bind4', ['Bind5']);
    container.addBind('Bind5', []);
    container.addBind('Bind3', ['Bind6', 'Bind7']);
    container.addBind('Bind6', ['Bind4', 'Bind7']);
    container.addBind('Bind7', ['Bind4', 'Bind5']);

    expect(() => bind1.validate()).to.not.throw(Error);
  });

  it('can detect top level dependency cycles', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind1']);

    expect(() => bind1.validate()).to.throw(Error, /"Bind1 ⇄ Bind1"/);
  });

  it('can detect nested level dependency cycles #1', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2']);
    container.addBind('Bind2', ['Bind3']);
    container.addBind('Bind3', ['Bind1']);

    expect(() => bind1.validate()).to.throw(Error, /"Bind1 ⇄ Bind2 ⇄ Bind3 ⇄ Bind1"/);
  });

  it('can detect nested level dependency cycles #2', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2', 'Bind3']);
    container.addBind('Bind2', []);
    container.addBind('Bind3', ['Bind4']);
    container.addBind('Bind4', ['Bind3']);

    expect(() => bind1.validate()).to.throw(Error, /"Bind1 → Bind3 ⇄ Bind4 ⇄ Bind3"/);
  });

  it('can detect nested level dependency cycles #3', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2', 'Bind3']);
    container.addBind('Bind2', ['Bind4', 'Bind5', 'Bind3']);
    container.addBind('Bind4', ['Bind5']);
    container.addBind('Bind5', ['Bind7']);
    container.addBind('Bind3', ['Bind6', 'Bind7']);
    container.addBind('Bind6', ['Bind4', 'Bind7']);
    container.addBind('Bind7', ['Bind4', 'Bind5']);

    expect(() => bind1.validate()).to.throw(Error, /"Bind1 → Bind2 → Bind4 ⇄ Bind5 ⇄ Bind7 ⇄ Bind4"/);
  });

  it('can validate simple binds as well', function() {
    const container = new Container();
    const bind1 = container.addBind('Bind1', ['Bind2']);
    container.addBind('Bind2', ['Bind3']);
    container.addSimpleBind('Bind3');

    expect(() => bind1.validate()).to.not.throw(Error);
  });
});
