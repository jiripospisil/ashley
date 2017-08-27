'use strict';

const Ashley = require('../..');

const container = new Ashley({
  root: __dirname
});

async function main() {
  // Shared sources. Notice the object binds do not specify the clone option,
  // thus each requester gets the same object.
  container.object('Config', {
    database: {
      uri: '<connection string>'
    }
  });

  container.object('Logger', console.log);
  container.object('RequestCounter', {
    current: 0
  });

  container.instance('DatabaseConnection', './shared/database_connection', ['Config', 'Logger'], {
    initialize: true,
    deinitialize: true
  });

  // Initialize the individual modules. Replace with an auto-loading mechanism
  // in real apps.
  container.instance('Module1', './module1', ['Logger', '@containers/self'], {
    deinitialize: true
  });
  container.resolve('Module1');

  container.instance('Module2', './module2', ['Logger', '@containers/self'], {
    deinitialize: true
  });
  container.resolve('Module2');

  // Call shutdown on the container before exiting. This makes the deinitialize
  // methods run.
  process.once('SIGINT', () => container.shutdown());
}

main().catch(console.error);
