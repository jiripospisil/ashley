'use strict';

class DatabaseConnection {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.logger('Shared: DatabaseConnection: Constructor');
  }

  async initialize() {
    this.logger(`Shared: DatabaseConnection: Connecting to the database "${this.config.database.uri}"`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.logger('Shared: DatabaseConnection: Connected.');
  }

  async deinitialize() {
    this.logger('Shared: DatabaseConnection: Disconnecting from the database');
    await new Promise(resolve => setTimeout(resolve, 900));
    this.logger('Shared: DatabaseConnection: Disconnected.');
  }
}

module.exports = DatabaseConnection;
