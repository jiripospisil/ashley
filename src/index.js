'use strict';

const Ashley = require('./ashley');

const TargetResolver = require('./target_resolver');
const CachingTargetResolver = require('./caching_target_resolver');

const InstanceProvider = require('./providers/instance_provider');
const ObjectProvider = require('./providers/object_provider');
const FactoryProvider = require('./providers/factory_provider');
const FunctionProvider = require('./providers/function_provider');

const SingletonScope = require('./scopes/singleton_scope');
const PrototypeScope = require('./scopes/prototype_scope');
const CloneScope = require('./scopes/clone_scope');

const BindFactory = require('./bind_factory');
const CompleteBind = require('./binds/complete_bind');
const FactoryBind = require('./binds/factory_bind');
const ClassBind = require('./binds/class_bind');
const ObjectBind = require('./binds/object_bind');

const utils = require('./utils');

module.exports = function(options) {
  const opts = options || {};
  const targetResolver = new CachingTargetResolver(new TargetResolver(opts));

  const bindFactory = new BindFactory({
    Instance: CompleteBind,
    Link: CompleteBind,
    Function: CompleteBind,
    Factory: FactoryBind,
    Object: ObjectBind,
    Provider: ClassBind,
    Scope: ClassBind
  });

  const ashley = new Ashley(targetResolver, bindFactory, opts);

  ashley.scope('Singleton', SingletonScope);
  ashley.scope('Prototype', PrototypeScope);
  ashley.scope('Clone', CloneScope);
  ashley.provider('Instance', InstanceProvider);
  ashley.provider('Object', ObjectProvider);
  ashley.provider('Factory', FactoryProvider);
  ashley.provider('Function', FunctionProvider);

  ashley.object('@containers/self', ashley);

  if (opts.parent) {
    ashley.object('@containers/parent', opts.parent);
  }

  return ashley;
};

module.exports._ = utils._;
