'use strict';

class Info {
  constructor(logger, requestCounter) {
    this.logger = logger;
    this.requestCounter = requestCounter;

    this.logger('Module1: Info: Constructor');
  }

  initialize() {
    this.intervalId = setInterval(() => {
      this.logger(`Module1: Info: Current number of requests: ${this.requestCounter.current}`);
    }, 1000);
  }

  deinitialize() {
    this.logger('Module1: Info: Deinitializing...');
    clearInterval(this.intervalId);
  }
}

module.exports = Info;
