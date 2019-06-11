import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | rental', function() {
  setupModelTest('rental', {
    needs: []
  });
  // Replace this with your real tests.
  it('exists', function() {
    let model = this.subject();
    expect(model).to.be.ok;
  });
});
