'use strict';

const debug = require('debug')('Ashley::Container');
const _ = require('lodash');

const utils = require('./utils');
const errors = require('./errors');

class Ashley {
  constructor(targetResolver, bindFactory, options) {
    this._targetResolver = targetResolver;
    this._bindFactory = bindFactory;
    this._options = options;

    this._binds = {};
    this._scopesToDeinitialize = [];
  }

  async shutdown() {
    for (const scope of this._scopesToDeinitialize) {
      if (scope.deinitialize) {
        await scope.deinitialize();
      }
    }
  }

  createChild() {
    const options = _.merge({}, this._options, { parent: this });
    return new Ashley(this._targetResolver, this._bindFactory, options);
  }

  instance(name, target, dependencies, options) {
    const resolvedTarget = this._targetResolver.resolve(target);

    const Provider = this._findBindOrThrow('@providers/Instance').get();
    const provider = new Provider(name, this, resolvedTarget, dependencies, options);
    const scope = this._createScope(provider, options);

    const bind = this._bind(name, this._bindFactory.create('Instance', this, name, scope, provider));

    this.factory(name, async function() {
      return await provider.create();
    });

    if (_.get(options, 'deinitialize')) {
      this._scopesToDeinitialize.push(scope);
    }

    return bind;
  }

  object(name, target, options) {
    const Provider = this._findBindOrThrow('@providers/Object').get();
    const provider = new Provider(name, this, target, options);
    const scope = this._createScope(provider, _.merge({}, options, { scope: 'Clone' }));

    return this._bind(name, this._bindFactory.create('Object', name, scope));
  }

  function(name, target, dependencies, options) {
    const resolvedTarget = this._targetResolver.resolve(target);

    const Provider = this._findBindOrThrow('@providers/Function').get();
    const provider = new Provider(name, this, resolvedTarget, dependencies);
    const scope = this._createScope(provider, options);

    return this._bind(name, this._bindFactory.create('Function', this, name, scope, provider));
  }

  factory(name, target, dependencies) {
    const resolvedTarget = this._targetResolver.resolve(target);

    const Provider = this._findBindOrThrow('@providers/Factory').get();
    const provider = new Provider(name, this, resolvedTarget, dependencies);

    return this._bind(`@factories/${name}`, this._bindFactory.create('Factory', this,
          name, provider));
  }

  link(name, factoryName, options) {
    const provider = this._findBindOrThrow(`@factories/${factoryName}`).get();
    const scope = this._createScope(provider, options);
    const bind = this._bind(name, this._bindFactory.create('Link', this, name, scope, provider));

    if (_.get(options, 'deinitialize')) {
      this._scopesToDeinitialize.push(scope);
    }

    return bind;
  }

  provider(name, target) {
    const resolvedTarget = this._targetResolver.resolve(target);

    return this._bind(`@providers/${name}`, this._bindFactory.create('Provider',
      name, resolvedTarget));
  }

  scope(name, target) {
    const resolvedTarget = this._targetResolver.resolve(target);

    return this._bind(`@scopes/${name}`, this._bindFactory.create('Scope',
      name, resolvedTarget));
  }

  async resolve(name) {
    debug(`Resolving "${name}".`);

    const bind = this.findBind(name);

    if (bind) {
      if (utils.isAsyncFunction(bind.get)) {
        return await bind.get();
      }
      return bind.get();
    }

    throw new errors.Error(`Unable to resolve unbinded target "${name}".`);
  }

  async resolveAll(names) {
    const results = [];

    for (const name of (names || [])) {
      results.push(await this.resolve(name));
    }

    return results;
  }


  validate() {
    _.forEach(this._binds, bind => {
      if (bind.validate) {
        bind.validate();
      }
    });
  }

  findBind(bindName) {
    let bind = this._binds[bindName];

    if (!bind && this._options.parent) {
      bind = this._options.parent.findBind(bindName);
    }

    return bind;
  }

  _createScope(provider, options) {
    const scopeName = _.get(options, 'scope', 'Singleton');
    const Scope = this._findBindOrThrow(`@scopes/${scopeName}`).get();

    const scope = new Scope(provider, options);
    return scope;
  }

  _findBindOrThrow(bindName) {
    const bind = this.findBind(bindName);

    if (!bind) {
      throw new errors.Error(`Unable to find a bind called "${bindName}".`);
    }

    return bind;
  }

  _bind(name, bind) {
    if (this._binds[name]) {
      throw new errors.Error(`There's already a bind called "${name}".`);
    }

    this._binds[name] = bind;

    return this.resolve.bind(this, name);
  }
}

module.exports = Ashley;
