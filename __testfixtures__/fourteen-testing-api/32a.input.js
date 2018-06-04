import { expect } from 'chai';
import {
  beforeEach,
  context,
  describe,
  it,
} from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | my-component', function () {
  setupComponentTest('my-component', {
    integration: true,
  });

  context('when in some situation or another', function () {
    beforeEach(function() {
      this.render(hbs`{{my-component}}`);
    });

    it('should do the thing', function () {
      expect(true).to.be.true;
    });
  });
});