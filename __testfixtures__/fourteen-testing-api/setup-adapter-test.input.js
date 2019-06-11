import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | rental', function() {
  setupTest('adapter:rental', {
    needs: ['service:store']
  });

  // Replace this with your real tests.
  it('exists', function() {
    let adapter = this.subject();
    expect(adapter).to.be.ok;
  });
});
