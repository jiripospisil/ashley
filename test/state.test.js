'use strict';

const { expect } = require('chai');
const State = require('../src/state');

describe('State', function() {
  it('can be used similarly to a stack', function() {
    const state1 = new State('target1');
    expect(state1.has('target1')).to.be.true;
    expect(state1.has('target2')).to.be.false;

    state1.push('target2');
    expect(state1.has('target2')).to.be.true;

    const state2 = state1.fork();
    expect(state2.has('target1')).to.be.true;
    expect(state2.has('target2')).to.be.true;

    state2.push('target3');
    expect(state1.has('target3')).to.be.false;
    expect(state2.has('target3')).to.be.true;
  });

  it('can be used to create a visual representation of the targets', function() {
    const state = new State(['target1', 'target2']);
    state.push('target3');

    expect(state.path('target1')).to.match(/^target1 ⇄ target2 ⇄ target3 ⇄ target1$/);
  });
});
