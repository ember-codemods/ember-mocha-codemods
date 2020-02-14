import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | rental', function() {
  setupModelTest('rental', {
    needs: []
  });
  // Replace this with your real tests.
  it('exists', function() {
    let model = this.subject({num: 5, obj: {key: 'val'}, arr: [1,'two']});
    expect(model).to.be.ok;
  });
});
