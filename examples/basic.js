'use strict';

const assert = require('assert');
const Ashley = require('..');

class DependencyA {
  constructor(dependencyC) {
    console.log('DependencyA: Constructor');

    assert(dependencyC instanceof DependencyC);

    this.dependencyC = dependencyC;
  }
}

class DependencyB {
  constructor(dependencyC) {
    console.log('DependencyB: Constructor');

    assert(dependencyC instanceof DependencyC);

    this.dependencyC = dependencyC;
  }
}

class DependencyC {
  constructor() {
    console.log('DependencyC: Constructor');
  }

  async initialize() {
    console.log('DependencyC: Initializing...');
    await new Promise(resolve => setTimeout(resolve, 900));
    console.log('DependencyC: Initialized');
  }

  deinitialize() {
    console.log('DependencyC: Deinitialized');
  }
}

class Client {
  constructor(dependencyA, dependencyB) {
    console.log('Client: Constructor');

    assert(dependencyA instanceof DependencyA);
    assert(dependencyB instanceof DependencyB);

    this.dependencyA = dependencyA;
    this.dependencyB = dependencyB;
  }
}

async function main() {
  const container = new Ashley();

  container.instance('Client', Client, ['DependencyA', 'DependencyB']);
  container.instance('DependencyA', DependencyA, ['DependencyC']);
  container.instance('DependencyB', DependencyB, ['DependencyC']);
  container.instance('DependencyC', DependencyC, [], {
    // scope: 'Prototype', // Defaults to Singleton
    initialize: true,
    deinitialize: true
  });

  const client = await container.resolve('Client');
  assert(client instanceof Client);

  await container.shutdown();
}

main().catch(console.error);
