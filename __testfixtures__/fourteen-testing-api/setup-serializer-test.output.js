import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Serializer | rental', function() {
  setupTest();

  // Replace this with your real tests.
  it('exists', function() {
    let serializer = this.owner.lookup('service:store').serializerFor('rental');

    expect(serializer).to.be.ok;
  });

});
