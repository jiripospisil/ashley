'use strict';

const Ashley = require('..');

class Dependency {
  constructor() {
    this.color = 'None';
  }
}

async function main() {
  const container = new Ashley();

  container.instance('GreenDependency', Dependency, [], {
    setup: function(dependency) {
      dependency.color = 'Green';
    }
  });

  container.instance('RedDependency', Dependency, [], {
    setup: async function(dependency) {
      await new Promise(resolve => setTimeout(resolve, 900));
      dependency.color = 'Red';
    }
  });

  container.instance('Dependency', Dependency);

  const green = await container.resolve('GreenDependency');
  console.log('Green.color ===', green.color);

  const red = await container.resolve('RedDependency');
  console.log('Red.color ===', red.color);

  const none = await container.resolve('Dependency');
  console.log('None.color ===', none.color);
}

main().catch(console.error);
