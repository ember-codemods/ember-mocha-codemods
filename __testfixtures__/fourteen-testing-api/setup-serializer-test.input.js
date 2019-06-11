import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Serializer | rental', function() {
  setupTest('serializer:rental', {
    needs: ['service:store']
  });

  // Replace this with your real tests.
  it('exists', function() {
    let serializer = this.subject();

    expect(serializer).to.be.ok;
  });

});
