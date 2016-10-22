'use strict';

const { expect } = require('chai');
const utils = require('../src/utils');

describe('Utils', function() {
  describe('.isGeneratorFunction', function() {
    it('detects whether the passed in object is a generator function', function() {
      expect(utils.isGeneratorFunction('notevenafunction')).to.be.false;
      expect(utils.isGeneratorFunction(function() {})).to.be.false;
      expect(utils.isGeneratorFunction(function*() {})).to.be.true;
    });
  });
});
