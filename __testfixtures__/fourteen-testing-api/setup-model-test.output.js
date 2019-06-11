import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | rental', function() {
  setupTest();
  // Replace this with your real tests.
  it('exists', function() {
    let model = this.owner.lookup('service:store').createRecord('rental', {});
    expect(model).to.be.ok;
  });
});
