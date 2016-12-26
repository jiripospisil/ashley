'use strict';

const Ashley = require('..');

function dateFactory() {
  return new Date();
}

async function main() {
  const container = new Ashley();

  container.factory('DateFactory', dateFactory);

  container.link('InitialDate', 'DateFactory', {
    scope: 'Singleton'
  });

  container.link('CurrentDate', 'DateFactory', {
    scope: 'Prototype'
  });

  console.log('InitialDate ===', await container.resolve('InitialDate'));
  await new Promise(resolve => setTimeout(resolve, 123));
  console.log('InitialDate ===', await container.resolve('InitialDate'));

  console.log('CurrentDate ===', await container.resolve('CurrentDate'));
  await new Promise(resolve => setTimeout(resolve, 123));
  console.log('CurrentDate ===', await container.resolve('CurrentDate'));
}

main().catch(console.error);
