'use strict';

const Scope = require('../scope');

/*
 * Singleton scope makes sure that only one instance of the target object is
 * created within the associated container.
 *
 * Note that the creation process needs to be synchronized. While it's true that
 * Node.js runs user code on a single thread and thus it's not necessary to
 * worry about data races or race conditions in the traditional sense, it's
 * still possible to have synchronization issues when an asynchronous IO is
 * involved (applies to timers, callbacks and others as well).
 *
 * In this particular case, the call to "provider.create()" might be
 * asynchronous. For example, the instance might have an "initialize" method
 * which will attempt to establish a connection to a database. The runtime will
 * handle the case by asking the OS to be notified when the connection is ready
 * and process other items on the event loop in the meantime. However, the next
 * item on the event loop might be another request for the instance. This can
 * happen very easily when the application is starting up. One possible solution
 * (used here) is to create what's essentially a spin lock and wait for the
 * instance to become available. The contract here is that it's up to the
 * programmer to ensure that the "initialize" method succeeds or throws an
 * exception.
 *
 */
class SingletonScope extends Scope {
  constructor(provider, options) {
    super(provider, options);
    this._instance = null;
    this._creating = false;
  }

  async get() {
    if (this._instance) {
      return this._instance;
    }

    while (this._creating) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (!this._instance) {
      this._creating = true;

      try {
        const instance = await this.provider.create();
        await this._setupInstance(instance);
        this._instance = instance;
      } catch (e) {
        this._creating = false;
        throw e;
      }

      this._creating = false;
    }

    return this._instance;
  }

  async deinitialize() {
    const instance = this._instance;
    this._instance = null;
    await this.provider.deinitializeInstance(instance);
  }
}

module.exports = SingletonScope;
