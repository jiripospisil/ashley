'use strict';

const Ashley = require('..');

class DependencyA {
  constructor(dependencyC) {
    console.log('DependencyA: Constructor');
    this.dependencyC = dependencyC;
  }
}

class DependencyB {
  constructor(dependencyC) {
    console.log('DependencyB: Constructor');
    this.dependencyC = dependencyC;
  }
}

class DependencyC {
  constructor() {
    console.log('DependencyC: Constructor');
  }
}

class Client {
  constructor(dependencyA, dependencyB) {
    this.dependencyA = dependencyA;
    this.dependencyB = dependencyB;
  }
}

async function main() {
  const container = new Ashley();

  container.instance('Client', Client, ['DependencyA', 'DependencyB']);
  container.instance('DependencyA', DependencyA, ['DependencyC']);
  container.instance('DependencyB', DependencyB, ['DependencyC']);

  // Create a cycle
  container.instance('DependencyC', DependencyC, ['DependencyA']);

  // Boom!
  await container.resolve('Client');
}

main().catch(console.error);
