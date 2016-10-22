'use strict';

const { expect } = require('chai');
const ClassBind = require('../../src/binds/class_bind');

describe('ClassBind', function() {
  it('returns the object given to it', function() {
    const bind = new ClassBind('name1', 'class1');
    expect(bind.get()).to.equal('class1');
  });
});
