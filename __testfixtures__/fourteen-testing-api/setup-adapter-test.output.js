import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | rental', function() {
  setupTest();

  // Replace this with your real tests.
  it('exists', function() {
    let adapter = this.owner.lookup('adapter:rental');
    expect(adapter).to.be.ok;
  });
});
