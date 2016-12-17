'use strict';

const { expect } = require('chai');
const utils = require('../src/utils');

describe('Utils', function() {
  describe('.isAsyncFunction', function() {
    it('detects whether the passed in object is an async function', function() {
      expect(utils.isAsyncFunction('notevenafunction')).to.be.false;
      expect(utils.isAsyncFunction(function() {})).to.be.false;
      expect(utils.isAsyncFunction(async function() {})).to.be.true;
    });
  });
});
