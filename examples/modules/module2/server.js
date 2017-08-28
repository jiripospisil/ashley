'use strict';

const http = require('http');

class Server {
  constructor(config, logger, databaseConnection, counter) {
    this.config = config;
    this.logger = logger;
    this.databaseConnection = databaseConnection;
    this.counter = counter;

    this.logger('Module2: Server: Constructor');
  }

  initialize() {
    this.logger('Module2: Server: Initializing');

    this.server = http.createServer();
    this.server.on('request', (req, res) => {
      this.logger('Module2: Server: Handling request', req.method, req.url, '...');
      this.counter.current++;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Something something from the database!');
    });

    const self = this;
    this.server.listen(0, function() {
      self.logger(`Module2: Server: Listening on http://localhost:${this.address().port}`);
    });
  }

  deinitialize() {
    this.logger('Module2: Server: Waiting for connections to close...');
    if (this.server.listening) {
      return new Promise(resolve => this.server.close(resolve));
    }
  }
}

module.exports = Server;
