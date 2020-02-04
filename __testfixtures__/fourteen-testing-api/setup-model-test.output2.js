import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | rental', function() {
  setupTest();
  // Replace this with your real tests.
  it('exists', function() {
    let model = this.owner.lookup('service:store').createRecord('rental', {num: 5, obj: {key: 'val'}, arr: [1,'two']});
    expect(model).to.be.ok;
  });
});
